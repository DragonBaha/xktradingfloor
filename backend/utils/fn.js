exports.getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? (page - 1) * limit : 0;

    return { limit, offset };
};

exports.getPaginationData = (data, page, limit) => {
    const { count: totalItems, docs } = data;
    const currentPage = page ? +page : 1;
    const totalPages = Math.ceil(totalItems / limit);
    return {
        data: docs,
        ...(limit
            ? { pagination: { totalItems, totalPages, currentPage, pageSize: limit } }
            : {}),
    };
};

exports.escapeRegex = (str) => {
    if (str && typeof str === 'string') {
        let searchString;
        searchString = str.trim().replace(/^[^a-zA-Z0-9]+/, '');
        searchString = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return searchString;
    } else {
        return "";
    }
}
