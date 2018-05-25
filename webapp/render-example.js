function(pdfDocument) {
    if (this.pdfDocument) {
        this._cancelRendering();
        this._resetView();
    }

    this.pdfDocument = pdfDocument;
    if (!pdfDocument) {
        return;
    }
    let pagesCount = pdfDocument.numPages;

    let pagesCapability = createPromiseCapability();
    this.pagesPromise = pagesCapability.promise;

    pagesCapability.promise.then(() => {
        this._pageViewsReady = true;
        this.eventBus.dispatch('pagesloaded', {
            source: this,
            pagesCount,
        });
    });

    let isOnePageRenderedResolved = false;
    let onePageRenderedCapability = createPromiseCapability();
    this.onePageRendered = onePageRenderedCapability.promise;

    let bindOnAfterAndBeforeDraw = (pageView) => {
        pageView.onBeforeDraw = () => {
            // Add the page to the buffer at the start of drawing. That way it can
            // be evicted from the buffer and destroyed even if we pause its
            // rendering.
            this._buffer.push(pageView);
        };
        pageView.onAfterDraw = () => {
            if (!isOnePageRenderedResolved) {
                isOnePageRenderedResolved = true;
                onePageRenderedCapability.resolve();
            }
        };
    };

    let firstPagePromise = pdfDocument.getPage(1);
    this.firstPagePromise = firstPagePromise;

    // Fetch a single page so we can get a viewport that will be the default
    // viewport for all pages
    firstPagePromise.then((pdfPage) => {
        let scale = this.currentScale;
        let viewport = pdfPage.getViewport(scale * CSS_UNITS);
        for (let pageNum = 1; pageNum <= pagesCount; ++pageNum) {
            let textLayerFactory = null;
            if (this.textLayerMode !== TextLayerMode.DISABLE) {
                textLayerFactory = this;
            }
            let pageView = new PDFPageView({
                                               container: this._setDocumentViewerElement,
                                               eventBus: this.eventBus,
                                               id: pageNum,
                                               scale,
                                               defaultViewport: viewport.clone(),
                                               renderingQueue: this.renderingQueue,
                                               textLayerFactory,
                                               textLayerMode: this.textLayerMode,
                                               annotationLayerFactory: this,
                                               imageResourcesPath: this.imageResourcesPath,
                                               renderInteractiveForms: this.renderInteractiveForms,
                                               renderer: this.renderer,
                                               enableWebGL: this.enableWebGL,
                                               useOnlyCssZoom: this.useOnlyCssZoom,
                                               maxCanvasPixels: this.maxCanvasPixels,
                                               l10n: this.l10n,
                                           });
            bindOnAfterAndBeforeDraw(pageView);
            this._pages.push(pageView);
        }
        if (this.spreadMode !== SpreadMode.NONE) {
            this._regroupSpreads();
        }

        // Fetch all the pages since the viewport is needed before printing
        // starts to create the correct size canvas. Wait until one page is
        // rendered so we don't tie up too many resources early on.
        onePageRenderedCapability.promise.then(() => {
            if (pdfDocument.loadingParams['disableAutoFetch']) {
                // XXX: Printing is semi-broken with auto fetch disabled.
                pagesCapability.resolve();
                return;
            }
            let getPagesLeft = pagesCount;
            for (let pageNum = 1; pageNum <= pagesCount; ++pageNum) {
                pdfDocument.getPage(pageNum).then((pdfPage) => {
                    let pageView = this._pages[pageNum - 1];
                    if (!pageView.pdfPage) {
                        pageView.setPdfPage(pdfPage);
                    }
                    this.linkService.cachePageRef(pageNum, pdfPage.ref);
                    if (--getPagesLeft === 0) {
                        pagesCapability.resolve();
                    }
                }, (reason) => {
                    console.error(`Unable to get page ${pageNum} to initialize viewer`,
                                  reason);
                    if (--getPagesLeft === 0) {
                        pagesCapability.resolve();
                    }
                });
            }
        });

        this.eventBus.dispatch('pagesinit', { source: this, });

        if (this.defaultRenderingQueue) {
            this.update();
        }

        if (this.findController) {
            this.findController.resolveFirstPage();
        }
    }).catch((reason) => {
        console.error('Unable to initialize viewer', reason);
    });
}
