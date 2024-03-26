//funciones solo para handlebars

export const if_eq = function(this: any, a: string, b: string, opts: any) {
    if (a == b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
}