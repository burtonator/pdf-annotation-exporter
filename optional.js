// simple optional implementation so we don't need to resort to jquery

var Optional = function(value) {
    this.value = value;
};

var None = new Optional();

var Some = function(value) {
    if (typeof value !== undefined) {
        return new Optional(value);
    }
    return None;
};

Optional.prototype.map = function(fn) {
    if (this.value !== undefined) {
        return new Some(fn(this.value));
    }
    return None;
};

Optional.prototype.getOrElse = function(value) {
    if (this.value !== undefined) {
        return this.value;
    }
    return value;
};

Optional.of = function(value) {
    return new Optional(value);
};

