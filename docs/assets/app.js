!function () {
    function c(i) {
        var o = Object.create(null);
        return function (e) {
            var n = f(e) ? e : JSON.stringify(e);
            return o[n] || (o[n] = i(e))
        }
    }
    var a = c(function (e) {
        return e.replace(/([A-Z])/g, function (e) {
            return "-" + e.toLowerCase()
        })
    })
        , u = Object.prototype.hasOwnProperty
        , m = Object.assign || function (e) {
            for (var n = arguments, i = 1; i < arguments.length; i++) {
                var o, t = Object(n[i]);
                for (o in t)
                    u.call(t, o) && (e[o] = t[o])
            }
            return e
        }
        ;
    function f(e) {
        return "string" == typeof e || "number" == typeof e
    }
    function d() { }
    function o(e) {
        return "function" == typeof e
    }
    function g(e) {
        var n = e.match(/^([^:/?#]+:)?(?:\/{2,}([^/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
        return "string" == typeof n[1] && 0 < n[1].length && n[1].toLowerCase() !== location.protocol || ("string" == typeof n[2] && 0 < n[2].length && n[2].replace(new RegExp(":(" + {
            "http:": 80,
            "https:": 443
        }[location.protocol] + ")?$"), "") !== location.host || !!/^\/\\/.test(e))
    }
    var s = document.body.clientWidth <= 600
        , t = window.history && window.history.pushState && window.history.replaceState && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]\D|WebApps\/.+CFNetwork)/)
        , i = {};
    function l(e, n) {
        if (void 0 === n && (n = !1),
            "string" == typeof e) {
            if (void 0 !== window.Vue)
                return b(e);
            e = n ? b(e) : i[e] || (i[e] = b(e))
        }
        return e
    }
    var v = document
        , h = v.body
        , _ = v.head;
    function b(e, n) {
        return n ? e.querySelector(n) : v.querySelector(e)
    }
    function k(e, n) {
        return [].slice.call(n ? e.querySelectorAll(n) : v.querySelectorAll(e))
    }
    function w(e, n) {
        return e = v.createElement(e),
            n && (e.innerHTML = n),
            e
    }
    function r(e, n) {
        return e.appendChild(n)
    }
    function y(e, n) {
        return e.insertBefore(n, e.children[0])
    }
    function p(e, n, i) {
        o(n) ? window.addEventListener(e, n) : e.addEventListener(n, i)
    }
    function x(e, n, i) {
        o(n) ? window.removeEventListener(e, n) : e.removeEventListener(n, i)
    }
    function S(e, n, i) {
        e && e.classList[i ? n : "toggle"](i || n)
    }
    function e(e, n) {
        var i = (n = void 0 === n ? document : n).readyState;
        if ("complete" === i || "interactive" === i)
            return setTimeout(e, 0);
        n.addEventListener("DOMContentLoaded", e)
    }
    var n = Object.freeze({
        __proto__: null,
        getNode: l,
        $: v,
        body: h,
        head: _,
        find: b,
        findAll: k,
        create: w,
        appendTo: r,
        before: y,
        on: p,
        off: x,
        toggleClass: S,
        style: function (e) {
            r(_, w("style", e))
        },
        documentReady: e
    });
    function A(e, n) {
        return -1 !== e.indexOf(n, e.length - n.length)
    }
    var $ = decodeURIComponent
        , z = encodeURIComponent;
    function F(e) {
        var n = {};
        return (e = e.trim().replace(/^(\?|#|&)/, "")) && e.split("&").forEach(function (e) {
            e = e.replace(/\+/g, " ").split("=");
            n[e[0]] = e[1] && $(e[1])
        }),
            n
    }
    function E(e, n) {
        void 0 === n && (n = []);
        var i, o = [];
        for (i in e)
            -1 < n.indexOf(i) || o.push(e[i] ? (z(i) + "=" + z(e[i])).toLowerCase() : z(i));
        return o.length ? "?" + o.join("&") : ""
    }
    var R = c(function (e) {
        return /(:|(\/{2}))/g.test(e)
    })
        , T = c(function (e) {
            return e.split(/[?#]/)[0]
        })
        , C = c(function (e) {
            if (/\/$/g.test(e))
                return e;
            e = e.match(/(\S*\/)[^/]+$/);
            return e ? e[1] : ""
        })
        , j = c(function (e) {
            return e.replace(/^\/+/, "/").replace(/([^:])\/{2,}/g, "$1/")
        })
        , L = c(function (e) {
            for (var n = e.replace(/^\//, "").split("/"), i = [], o = 0, t = n.length; o < t; o++) {
                var a = n[o];
                ".." === a ? i.pop() : "." !== a && i.push(a)
            }
            return "/" + i.join("/")
        });
    function O(e) {
        return e.split("/").filter(function (e) {
            return -1 === e.indexOf("#")
        }).join("/")
    }
    function q() {
        for (var e = [], n = arguments.length; n--;)
            e[n] = arguments[n];
        return j(e.map(O).join("/"))
    }
    var P = c(function (e) {
        return e.replace("#", "?id=")
    })
        , M = {};
    function I(e) {
        this.config = e
    }
    function N(e) {
        var n = location.href.indexOf("#");
        location.replace(location.href.slice(0, 0 <= n ? n : 0) + "#" + e)
    }
    I.prototype.getBasePath = function () {
        return this.config.basePath
    }
        ,
        I.prototype.getFile = function (e, n) {
            void 0 === e && (e = this.getCurrentPath());
            var i, o, t = this.config, a = this.getBasePath(), r = "string" == typeof t.ext ? t.ext : ".md";
            return e = t.alias ? function e(n, i, o) {
                var t = Object.keys(i).filter(function (e) {
                    return (M[e] || (M[e] = new RegExp("^" + e + "$"))).test(n) && n !== o
                })[0];
                return t ? e(n.replace(M[t], i[t]), i, n) : n
            }(e, t.alias) : e,
                i = e,
                o = r,
                e = (e = new RegExp("\\.(" + o.replace(/^\./, "") + "|html)$", "g").test(i) ? i : /\/$/g.test(i) ? i + "README" + o : "" + i + o) === "/README" + r && t.homepage || e,
                e = R(e) ? e : q(a, e),
                e = n ? e.replace(new RegExp("^" + a), "") : e
        }
        ,
        I.prototype.onchange = function (e) {
            (e = void 0 === e ? d : e)()
        }
        ,
        I.prototype.getCurrentPath = function () { }
        ,
        I.prototype.normalize = function () { }
        ,
        I.prototype.parse = function () { }
        ,
        I.prototype.toURL = function (e, n, i) {
            var o = i && "#" === e[0]
                , t = this.parse(P(e));
            if (t.query = m({}, t.query, n),
                e = (e = t.path + E(t.query)).replace(/\.md(\?)|\.md$/, "$1"),
                o && (e = (0 < (o = i.indexOf("?")) ? i.substring(0, o) : i) + e),
                this.config.relativePath && 0 !== e.indexOf("/")) {
                i = i.substring(0, i.lastIndexOf("/") + 1);
                return j(L(i + e))
            }
            return j("/" + e)
        }
        ;
    var H = function (o) {
        function e(e) {
            o.call(this, e),
                this.mode = "hash"
        }
        return o && (e.__proto__ = o),
            ((e.prototype = Object.create(o && o.prototype)).constructor = e).prototype.getBasePath = function () {
                var e = window.location.pathname || ""
                    , n = this.config.basePath
                    , e = A(e, ".html") ? e + "#/" + n : e + "/" + n;
                return /^(\/|https?:)/g.test(n) ? n : j(e)
            }
            ,
            e.prototype.getCurrentPath = function () {
                var e = location.href
                    , n = e.indexOf("#");
                return -1 === n ? "" : e.slice(n + 1)
            }
            ,
            e.prototype.onchange = function (i) {
                void 0 === i && (i = d);
                var o = !1;
                p("click", function (e) {
                    e = "A" === e.target.tagName ? e.target : e.target.parentNode;
                    e && "A" === e.tagName && !g(e.href) && (o = !0)
                }),
                    p("hashchange", function (e) {
                        var n = o ? "navigate" : "history";
                        o = !1,
                            i({
                                event: e,
                                source: n
                            })
                    })
            }
            ,
            e.prototype.normalize = function () {
                var e = this.getCurrentPath();
                if ("/" === (e = P(e)).charAt(0))
                    return N(e);
                N("/" + e)
            }
            ,
            e.prototype.parse = function (e) {
                var n = ""
                    , i = (e = void 0 === e ? location.href : e).indexOf("#")
                    , i = (e = 0 <= i ? e.slice(i + 1) : e).indexOf("?");
                return 0 <= i && (n = e.slice(i + 1),
                    e = e.slice(0, i)),
                {
                    path: e,
                    file: this.getFile(e, !0),
                    query: F(n)
                }
            }
            ,
            e.prototype.toURL = function (e, n, i) {
                return "#" + o.prototype.toURL.call(this, e, n, i)
            }
            ,
            e
    }(I)
        , D = function (n) {
            function e(e) {
                n.call(this, e),
                    this.mode = "history"
            }
            return n && (e.__proto__ = n),
                ((e.prototype = Object.create(n && n.prototype)).constructor = e).prototype.getCurrentPath = function () {
                    var e = this.getBasePath()
                        , n = window.location.pathname;
                    return ((n = e && 0 === n.indexOf(e) ? n.slice(e.length) : n) || "/") + window.location.search + window.location.hash
                }
                ,
                e.prototype.onchange = function (i) {
                    void 0 === i && (i = d),
                        p("click", function (e) {
                            var n = "A" === e.target.tagName ? e.target : e.target.parentNode;
                            n && "A" === n.tagName && !g(n.href) && (e.preventDefault(),
                                n = n.href,
                                window.history.pushState({
                                    key: n
                                }, "", n),
                                i({
                                    event: e,
                                    source: "navigate"
                                }))
                        }),
                        p("popstate", function (e) {
                            i({
                                event: e,
                                source: "history"
                            })
                        })
                }
                ,
                e.prototype.parse = function (e) {
                    var n = ""
                        , i = (e = void 0 === e ? location.href : e).indexOf("?");
                    0 <= i && (n = e.slice(i + 1),
                        e = e.slice(0, i));
                    var o = q(location.origin)
                        , i = e.indexOf(o);
                    return {
                        path: e = -1 < i ? e.slice(i + o.length) : e,
                        file: this.getFile(e),
                        query: F(n)
                    }
                }
                ,
                e
        }(I)
        , U = {};
    var Z, B, V = /([^{]*?)\w(?=\})/g, Y = {
        YYYY: "getFullYear",
        YY: "getYear",
        MM: function (e) {
            return e.getMonth() + 1
        },
        DD: "getDate",
        HH: "getHours",
        mm: "getMinutes",
        ss: "getSeconds",
        fff: "getMilliseconds"
    };
    function G(e) {
        var n, i = e.loaded, o = e.total, t = e.step;
        Z || ((e = w("div")).classList.add("progress"),
            r(h, e),
            Z = e),
            n = t ? 80 < (n = parseInt(Z.style.width || 0, 10) + t) ? 80 : n : Math.floor(i / o * 100),
            Z.style.opacity = 1,
            Z.style.width = 95 <= n ? "100%" : n + "%",
            95 <= n && (clearTimeout(B),
                B = setTimeout(function (e) {
                    Z.style.opacity = 0,
                        Z.style.width = "0%"
                }, 200))
    }
    var W = {};
    function X(t, e, n) {
        void 0 === e && (e = !1),
            void 0 === n && (n = {});
        function a() {
            r.addEventListener.apply(r, arguments)
        }
        var i, r = new XMLHttpRequest, o = W[t];
        if (o)
            return {
                then: function (e) {
                    return e(o.content, o.opt)
                },
                abort: d
            };
        for (i in r.open("GET", t),
            n)
            u.call(n, i) && r.setRequestHeader(i, n[i]);
        return r.send(),
        {
            then: function (n, i) {
                var o;
                void 0 === i && (i = d),
                    e && (o = setInterval(function (e) {
                        return G({
                            step: Math.floor(5 * Math.random() + 1)
                        })
                    }, 500),
                        a("progress", G),
                        a("loadend", function (e) {
                            G(e),
                                clearInterval(o)
                        })),
                    a("error", i),
                    a("load", function (e) {
                        var e = e.target;
                        400 <= e.status ? i(e) : (e = W[t] = {
                            content: e.response,
                            opt: {
                                updatedAt: r.getResponseHeader("last-modified")
                            }
                        },
                            n(e.content, e.opt))
                    })
            },
            abort: function (e) {
                return 4 !== r.readyState && r.abort()
            }
        }
    }
    function Q(e, n) {
        e.innerHTML = e.innerHTML.replace(/var\(\s*--theme-color.*?\)/g, n)
    }
    var J = v.title;
    function K() {
        var e, n = l("section.cover");
        n && (e = n.getBoundingClientRect().height,
            window.pageYOffset >= e || n.classList.contains("hidden") ? S(h, "add", "sticky") : S(h, "remove", "sticky"))
    }
    function ee(e, n, o, i) {
        var t = [];
        null != (n = l(n)) && (t = k(n, "a"));
        var a, r = decodeURI(e.toURL(e.getCurrentPath()));
        return t.sort(function (e, n) {
            return n.href.length - e.href.length
        }).forEach(function (e) {
            var n = decodeURI(e.getAttribute("href"))
                , i = o ? e.parentNode : e;
            e.title = e.title || e.innerText,
                0 !== r.indexOf(n) || a ? S(i, "remove", "active") : (a = e,
                    S(i, "add", "active"))
        }),
            i && (v.title = a ? a.title || a.innerText + " - " + J : J),
            a
    }
    function ne(e, n) {
        for (var i = 0; i < n.length; i++) {
            var o = n[i];
            o.enumerable = o.enumerable || !1,
                o.configurable = !0,
                "value" in o && (o.writable = !0),
                Object.defineProperty(e, o.key, o)
        }
    }
    var ie = (function (e, n, i) {
        return n && ne(e.prototype, n),
            i && ne(e, i),
            e
    }(oe, [{
        key: "getIntermediateValue",
        value: function (e) {
            return this.decimal ? e : Math.round(e)
        }
    }, {
        key: "getFinalValue",
        value: function () {
            return this.end
        }
    }]),
        oe);
    function oe() {
        var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {};
        !function (e, n) {
            if (!(e instanceof n))
                throw new TypeError("Cannot call a class as a function")
        }(this, oe),
            this.start = e.start,
            this.end = e.end,
            this.decimal = e.decimal
    }
    function te(e, n) {
        for (var i = 0; i < n.length; i++) {
            var o = n[i];
            o.enumerable = o.enumerable || !1,
                o.configurable = !0,
                "value" in o && (o.writable = !0),
                Object.defineProperty(e, o.key, o)
        }
    }
    var ae = (function (e, n, i) {
        return n && te(e.prototype, n),
            i && te(e, i),
            e
    }(re, [{
        key: "begin",
        value: function () {
            return this.isRunning || this.next === this.end || (this.frame = window.requestAnimationFrame(this._tick.bind(this))),
                this
        }
    }, {
        key: "stop",
        value: function () {
            return window.cancelAnimationFrame(this.frame),
                this.isRunning = !1,
                this.frame = null,
                this.timeStart = null,
                this.next = null,
                this
        }
    }, {
        key: "on",
        value: function (e, n) {
            return this.events[e] = this.events[e] || [],
                this.events[e].push(n),
                this
        }
    }, {
        key: "_emit",
        value: function (e, n) {
            var i = this
                , e = this.events[e];
            e && e.forEach(function (e) {
                return e.call(i, n)
            })
        }
    }, {
        key: "_tick",
        value: function (e) {
            this.isRunning = !0;
            var n = this.next || this.start;
            this.timeStart || (this.timeStart = e),
                this.timeElapsed = e - this.timeStart,
                this.next = this.ease(this.timeElapsed, this.start, this.end - this.start, this.duration),
                this._shouldTick(n) ? (this._emit("tick", this.tweener.getIntermediateValue(this.next)),
                    this.frame = window.requestAnimationFrame(this._tick.bind(this))) : (this._emit("tick", this.tweener.getFinalValue()),
                        this._emit("done", null))
        }
    }, {
        key: "_shouldTick",
        value: function (e) {
            return {
                up: this.next < this.end && e <= this.next,
                down: this.next > this.end && e >= this.next
            }[this.direction]
        }
    }, {
        key: "_defaultEase",
        value: function (e, n, i, o) {
            return (e /= o / 2) < 1 ? i / 2 * e * e + n : -i / 2 * (--e * (e - 2) - 1) + n
        }
    }]),
        re);
    function re() {
        var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {};
        !function (e, n) {
            if (!(e instanceof n))
                throw new TypeError("Cannot call a class as a function")
        }(this, re),
            this.duration = e.duration || 1e3,
            this.ease = e.easing || this._defaultEase,
            this.tweener = e.tweener || new ie(e),
            this.start = this.tweener.start,
            this.end = this.tweener.end,
            this.frame = null,
            this.next = null,
            this.isRunning = !1,
            this.events = {},
            this.direction = this.start < this.end ? "up" : "down"
    }
    var ce = document.currentScript;
    function ue(e) {
        var n, i = m({
            auto2top: !1,
            autoHeader: !1,
            basePath: "",
            catchPluginErrors: !0,
            cornerExternalLinkTarget: "_blank",
            coverpage: "",
            el: "#app",
            executeScript: null,
            ext: ".md",
            externalLinkRel: "noopener",
            externalLinkTarget: "_blank",
            formatUpdated: "",
            ga: "",
            homepage: "README.md",
            loadNavbar: null,
            loadSidebar: null,
            maxLevel: 6,
            mergeNavbar: !1,
            name: "",
            nameLink: window.location.pathname,
            nativeEmoji: !1,
            noCompileLinks: [],
            noEmoji: !1,
            notFoundPage: !0,
            relativePath: !1,
            repo: "",
            routes: {},
            routerMode: "hash",
            subMaxLevel: 0,
            themeColor: "",
            topMargin: 0
        }, "function" == typeof window.$docsify ? window.$docsify(e) : window.$docsify), o = ce || [].slice.call(document.getElementsByTagName("script")).filter(function (e) {
            return /docsify\./.test(e.src)
        })[0];
        if (o)
            for (var t in i)
                !u.call(i, t) || f(n = o.getAttribute("data-" + a(t))) && (i[t] = "" === n || n);
        return !0 === i.loadSidebar && (i.loadSidebar = "_sidebar" + i.ext),
            !0 === i.loadNavbar && (i.loadNavbar = "_navbar" + i.ext),
            !0 === i.coverpage && (i.coverpage = "_coverpage" + i.ext),
            !0 === i.repo && (i.repo = ""),
            !0 === i.name && (i.name = ""),
            window.$docsify = i
    }
    var fe = {}
        , pe = !1
        , de = null
        , ge = !0
        , se = 0;
    function le(e) {
        if (ge) {
            for (var n, i = l(".sidebar"), o = k(".anchor"), t = b(i, ".sidebar-nav"), a = b(i, "li.active"), r = document.documentElement, c = (r && r.scrollTop || document.body.scrollTop) - se, u = 0, f = o.length; u < f; u += 1) {
                var p = o[u];
                if (p.offsetTop > c) {
                    n = n || p;
                    break
                }
                n = p
            }
            !n || (r = fe[ve(e, n.getAttribute("data-id"))]) && r !== a && (a && a.classList.remove("active"),
                r.classList.add("active"),
                a = r,
                !pe && h.classList.contains("sticky") && (e = i.clientHeight,
                    r = a.offsetTop + a.clientHeight + 40,
                    a = a.offsetTop >= t.scrollTop && r <= t.scrollTop + e,
                    i.scrollTop = a ? t.scrollTop : +r < e ? 0 : r - e))
        }
    }
    function ve(e, n) {
        return decodeURIComponent(e) + "?id=" + decodeURIComponent(n)
    }
    function he(e, n) {
        var i, o;
        n && (o = ue().topMargin,
            (i = b("#" + n)) && (i = i,
                void 0 === (o = o) && (o = 0),
                de && de.stop(),
                ge = !1,
                de = new ae({
                    start: window.pageYOffset,
                    end: Math.round(i.getBoundingClientRect().top) + window.pageYOffset - o,
                    duration: 500
                }).on("tick", function (e) {
                    return window.scrollTo(0, e)
                }).on("done", function () {
                    ge = !0,
                        de = null
                }).begin()),
            e = fe[ve(e, n)],
            (n = b(l(".sidebar"), "li.active")) && n.classList.remove("active"),
            e && e.classList.add("active"))
    }
    var _e = v.scrollingElement || v.documentElement;
    var me = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};
    function be(e, n) {
        return e(n = {
            exports: {}
        }, n.exports),
            n.exports
    }
    function ke(e) {
        return $e[e]
    }
    var we = be(function (n) {
        function e() {
            return {
                baseUrl: null,
                breaks: !1,
                gfm: !0,
                headerIds: !0,
                headerPrefix: "",
                highlight: null,
                langPrefix: "language-",
                mangle: !0,
                pedantic: !1,
                renderer: null,
                sanitize: !1,
                sanitizer: null,
                silent: !1,
                smartLists: !1,
                smartypants: !1,
                tokenizer: null,
                walkTokens: null,
                xhtml: !1
            }
        }
        n.exports = {
            defaults: e(),
            getDefaults: e,
            changeDefaults: function (e) {
                n.exports.defaults = e
            }
        }
    })
        , ye = (we.defaults,
            we.getDefaults,
            we.changeDefaults,
            /[&<>"']/)
        , xe = /[&<>"']/g
        , Se = /[<>"']|&(?!#?\w+;)/
        , Ae = /[<>"']|&(?!#?\w+;)/g
        , $e = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
    var ze = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi;
    function Fe(e) {
        return e.replace(ze, function (e, n) {
            return "colon" === (n = n.toLowerCase()) ? ":" : "#" === n.charAt(0) ? "x" === n.charAt(1) ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1)) : ""
        })
    }
    var Ee = /(^|[^\[])\^/g;
    var Re = /[^\w:]/g
        , Te = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
    var Ce = {}
        , je = /^[^:]+:\/*[^/]*$/
        , Le = /^([^:]+:)[\s\S]*$/
        , Oe = /^([^:]+:\/*[^/]*)[\s\S]*$/;
    function qe(e, n) {
        Ce[" " + e] || (je.test(e) ? Ce[" " + e] = e + "/" : Ce[" " + e] = Pe(e, "/", !0));
        var i = -1 === (e = Ce[" " + e]).indexOf(":");
        return "//" === n.substring(0, 2) ? i ? n : e.replace(Le, "$1") + n : "/" === n.charAt(0) ? i ? n : e.replace(Oe, "$1") + n : e + n
    }
    function Pe(e, n, i) {
        var o = e.length;
        if (0 === o)
            return "";
        for (var t = 0; t < o;) {
            var a = e.charAt(o - t - 1);
            if (a !== n || i) {
                if (a === n || !i)
                    break;
                t++
            } else
                t++
        }
        return e.substr(0, o - t)
    }
    var Me = function (e, n) {
        if (n) {
            if (ye.test(e))
                return e.replace(xe, ke)
        } else if (Se.test(e))
            return e.replace(Ae, ke);
        return e
    }
        , Ie = Fe
        , Ne = function (i, e) {
            i = i.source || i,
                e = e || "";
            var o = {
                replace: function (e, n) {
                    return n = (n = n.source || n).replace(Ee, "$1"),
                        i = i.replace(e, n),
                        o
                },
                getRegex: function () {
                    return new RegExp(i, e)
                }
            };
            return o
        }
        , He = function (e, n, i) {
            if (e) {
                var o;
                try {
                    o = decodeURIComponent(Fe(i)).replace(Re, "").toLowerCase()
                } catch (e) {
                    return null
                }
                if (0 === o.indexOf("javascript:") || 0 === o.indexOf("vbscript:") || 0 === o.indexOf("data:"))
                    return null
            }
            n && !Te.test(i) && (i = qe(n, i));
            try {
                i = encodeURI(i).replace(/%25/g, "%")
            } catch (e) {
                return null
            }
            return i
        }
        , De = {
            exec: function () { }
        }
        , Ue = function (e) {
            for (var n, i, o = arguments, t = 1; t < arguments.length; t++)
                for (i in n = o[t])
                    Object.prototype.hasOwnProperty.call(n, i) && (e[i] = n[i]);
            return e
        }
        , Ze = function (e, n) {
            var i = e.replace(/\|/g, function (e, n, i) {
                for (var o = !1, t = n; 0 <= --t && "\\" === i[t];)
                    o = !o;
                return o ? "|" : " |"
            }).split(/ \|/)
                , o = 0;
            if (i.length > n)
                i.splice(n);
            else
                for (; i.length < n;)
                    i.push("");
            for (; o < i.length; o++)
                i[o] = i[o].trim().replace(/\\\|/g, "|");
            return i
        }
        , Be = Pe
        , Ve = function (e, n) {
            if (-1 === e.indexOf(n[1]))
                return -1;
            for (var i = e.length, o = 0, t = 0; t < i; t++)
                if ("\\" === e[t])
                    t++;
                else if (e[t] === n[0])
                    o++;
                else if (e[t] === n[1] && --o < 0)
                    return t;
            return -1
        }
        , Ye = function (e) {
            e && e.sanitize && !e.silent && console.warn("marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options")
        }
        , Ge = function (e, n) {
            if (n < 1)
                return "";
            for (var i = ""; 1 < n;)
                1 & n && (i += e),
                    n >>= 1,
                    e += e;
            return i + e
        }
        , We = we.defaults
        , Xe = Be
        , Qe = Ze
        , Je = Me
        , Ke = Ve;
    function en(e, n, i) {
        var o = n.href
            , t = n.title ? Je(n.title) : null
            , n = e[1].replace(/\\([\[\]])/g, "$1");
        return "!" !== e[0].charAt(0) ? {
            type: "link",
            raw: i,
            href: o,
            title: t,
            text: n
        } : {
            type: "image",
            raw: i,
            href: o,
            title: t,
            text: Je(n)
        }
    }
    var nn = function () {
        function e(e) {
            this.options = e || We
        }
        return e.prototype.space = function (e) {
            e = this.rules.block.newline.exec(e);
            if (e)
                return 1 < e[0].length ? {
                    type: "space",
                    raw: e[0]
                } : {
                    raw: "\n"
                }
        }
            ,
            e.prototype.code = function (e, n) {
                e = this.rules.block.code.exec(e);
                if (e) {
                    n = n[n.length - 1];
                    if (n && "paragraph" === n.type)
                        return {
                            raw: e[0],
                            text: e[0].trimRight()
                        };
                    n = e[0].replace(/^ {1,4}/gm, "");
                    return {
                        type: "code",
                        raw: e[0],
                        codeBlockStyle: "indented",
                        text: this.options.pedantic ? n : Xe(n, "\n")
                    }
                }
            }
            ,
            e.prototype.fences = function (e) {
                var n = this.rules.block.fences.exec(e);
                if (n) {
                    var i = n[0]
                        , e = function (e, n) {
                            if (null === (e = e.match(/^(\s+)(?:```)/)))
                                return n;
                            var i = e[1];
                            return n.split("\n").map(function (e) {
                                var n = e.match(/^\s+/);
                                return null !== n && n[0].length >= i.length ? e.slice(i.length) : e
                            }).join("\n")
                        }(i, n[3] || "");
                    return {
                        type: "code",
                        raw: i,
                        lang: n[2] && n[2].trim(),
                        text: e
                    }
                }
            }
            ,
            e.prototype.heading = function (e) {
                var n = this.rules.block.heading.exec(e);
                if (n) {
                    var i = n[2].trim();
                    return /#$/.test(i) && (e = Xe(i, "#"),
                        !this.options.pedantic && e && !/ $/.test(e) || (i = e.trim())),
                    {
                        type: "heading",
                        raw: n[0],
                        depth: n[1].length,
                        text: i
                    }
                }
            }
            ,
            e.prototype.nptable = function (e) {
                e = this.rules.block.nptable.exec(e);
                if (e) {
                    var n = {
                        type: "table",
                        header: Qe(e[1].replace(/^ *| *\| *$/g, "")),
                        align: e[2].replace(/^ *|\| *$/g, "").split(/ *\| */),
                        cells: e[3] ? e[3].replace(/\n$/, "").split("\n") : [],
                        raw: e[0]
                    };
                    if (n.header.length === n.align.length) {
                        for (var i = n.align.length, o = 0; o < i; o++)
                            /^ *-+: *$/.test(n.align[o]) ? n.align[o] = "right" : /^ *:-+: *$/.test(n.align[o]) ? n.align[o] = "center" : /^ *:-+ *$/.test(n.align[o]) ? n.align[o] = "left" : n.align[o] = null;
                        for (i = n.cells.length,
                            o = 0; o < i; o++)
                            n.cells[o] = Qe(n.cells[o], n.header.length);
                        return n
                    }
                }
            }
            ,
            e.prototype.hr = function (e) {
                e = this.rules.block.hr.exec(e);
                if (e)
                    return {
                        type: "hr",
                        raw: e[0]
                    }
            }
            ,
            e.prototype.blockquote = function (e) {
                var n = this.rules.block.blockquote.exec(e);
                if (n) {
                    e = n[0].replace(/^ *> ?/gm, "");
                    return {
                        type: "blockquote",
                        raw: n[0],
                        text: e
                    }
                }
            }
            ,
            e.prototype.list = function (e) {
                e = this.rules.block.list.exec(e);
                if (e) {
                    for (var n, i, o, t, a, r = e[0], c = e[2], u = 1 < c.length, f = {
                        type: "list",
                        raw: r,
                        ordered: u,
                        start: u ? +c.slice(0, -1) : "",
                        loose: !1,
                        items: []
                    }, p = e[0].match(this.rules.block.item), d = !1, g = p.length, s = this.rules.block.listItemStart.exec(p[0]), l = 0; l < g; l++) {
                        if (r = n = p[l],
                            l !== g - 1) {
                            if (o = this.rules.block.listItemStart.exec(p[l + 1]),
                                this.options.pedantic ? o[1].length > s[1].length : o[1].length > s[0].length || 3 < o[1].length) {
                                p.splice(l, 2, p[l] + "\n" + p[l + 1]),
                                    l--,
                                    g--;
                                continue
                            }
                            (!this.options.pedantic || this.options.smartLists ? o[2][o[2].length - 1] !== c[c.length - 1] : u == (1 === o[2].length)) && (i = p.slice(l + 1).join("\n"),
                                f.raw = f.raw.substring(0, f.raw.length - i.length),
                                l = g - 1),
                                s = o
                        }
                        o = n.length,
                            ~(n = n.replace(/^ *([*+-]|\d+[.)]) ?/, "")).indexOf("\n ") && (o -= n.length,
                                n = this.options.pedantic ? n.replace(/^ {1,4}/gm, "") : n.replace(new RegExp("^ {1," + o + "}", "gm"), "")),
                            o = d || /\n\n(?!\s*$)/.test(n),
                            l !== g - 1 && (d = "\n" === n.charAt(n.length - 1),
                                o = o || d),
                            o && (f.loose = !0),
                            this.options.gfm && (a = void 0,
                                (t = /^\[[ xX]\] /.test(n)) && (a = " " !== n[1],
                                    n = n.replace(/^\[[ xX]\] +/, ""))),
                            f.items.push({
                                type: "list_item",
                                raw: r,
                                task: t,
                                checked: a,
                                loose: o,
                                text: n
                            })
                    }
                    return f
                }
            }
            ,
            e.prototype.html = function (e) {
                e = this.rules.block.html.exec(e);
                if (e)
                    return {
                        type: this.options.sanitize ? "paragraph" : "html",
                        raw: e[0],
                        pre: !this.options.sanitizer && ("pre" === e[1] || "script" === e[1] || "style" === e[1]),
                        text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(e[0]) : Je(e[0]) : e[0]
                    }
            }
            ,
            e.prototype.def = function (e) {
                e = this.rules.block.def.exec(e);
                if (e)
                    return e[3] && (e[3] = e[3].substring(1, e[3].length - 1)),
                    {
                        tag: e[1].toLowerCase().replace(/\s+/g, " "),
                        raw: e[0],
                        href: e[2],
                        title: e[3]
                    }
            }
            ,
            e.prototype.table = function (e) {
                e = this.rules.block.table.exec(e);
                if (e) {
                    var n = {
                        type: "table",
                        header: Qe(e[1].replace(/^ *| *\| *$/g, "")),
                        align: e[2].replace(/^ *|\| *$/g, "").split(/ *\| */),
                        cells: e[3] ? e[3].replace(/\n$/, "").split("\n") : []
                    };
                    if (n.header.length === n.align.length) {
                        n.raw = e[0];
                        for (var i = n.align.length, o = 0; o < i; o++)
                            /^ *-+: *$/.test(n.align[o]) ? n.align[o] = "right" : /^ *:-+: *$/.test(n.align[o]) ? n.align[o] = "center" : /^ *:-+ *$/.test(n.align[o]) ? n.align[o] = "left" : n.align[o] = null;
                        for (i = n.cells.length,
                            o = 0; o < i; o++)
                            n.cells[o] = Qe(n.cells[o].replace(/^ *\| *| *\| *$/g, ""), n.header.length);
                        return n
                    }
                }
            }
            ,
            e.prototype.lheading = function (e) {
                e = this.rules.block.lheading.exec(e);
                if (e)
                    return {
                        type: "heading",
                        raw: e[0],
                        depth: "=" === e[2].charAt(0) ? 1 : 2,
                        text: e[1]
                    }
            }
            ,
            e.prototype.paragraph = function (e) {
                e = this.rules.block.paragraph.exec(e);
                if (e)
                    return {
                        type: "paragraph",
                        raw: e[0],
                        text: "\n" === e[1].charAt(e[1].length - 1) ? e[1].slice(0, -1) : e[1]
                    }
            }
            ,
            e.prototype.text = function (e, n) {
                e = this.rules.block.text.exec(e);
                if (e) {
                    n = n[n.length - 1];
                    return n && "text" === n.type ? {
                        raw: e[0],
                        text: e[0]
                    } : {
                        type: "text",
                        raw: e[0],
                        text: e[0]
                    }
                }
            }
            ,
            e.prototype.escape = function (e) {
                e = this.rules.inline.escape.exec(e);
                if (e)
                    return {
                        type: "escape",
                        raw: e[0],
                        text: Je(e[1])
                    }
            }
            ,
            e.prototype.tag = function (e, n, i) {
                e = this.rules.inline.tag.exec(e);
                if (e)
                    return !n && /^<a /i.test(e[0]) ? n = !0 : n && /^<\/a>/i.test(e[0]) && (n = !1),
                        !i && /^<(pre|code|kbd|script)(\s|>)/i.test(e[0]) ? i = !0 : i && /^<\/(pre|code|kbd|script)(\s|>)/i.test(e[0]) && (i = !1),
                    {
                        type: this.options.sanitize ? "text" : "html",
                        raw: e[0],
                        inLink: n,
                        inRawBlock: i,
                        text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(e[0]) : Je(e[0]) : e[0]
                    }
            }
            ,
            e.prototype.link = function (e) {
                var n = this.rules.inline.link.exec(e);
                if (n) {
                    e = n[2].trim();
                    if (!this.options.pedantic && /^</.test(e)) {
                        if (!/>$/.test(e))
                            return;
                        var i = Xe(e.slice(0, -1), "\\");
                        if ((e.length - i.length) % 2 == 0)
                            return
                    } else {
                        var o = Ke(n[2], "()");
                        -1 < o && (t = (0 === n[0].indexOf("!") ? 5 : 4) + n[1].length + o,
                            n[2] = n[2].substring(0, o),
                            n[0] = n[0].substring(0, t).trim(),
                            n[3] = "")
                    }
                    var t, i = n[2], o = "";
                    return this.options.pedantic ? (t = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(i)) && (i = t[1],
                        o = t[3]) : o = n[3] ? n[3].slice(1, -1) : "",
                        i = i.trim(),
                        en(n, {
                            href: (i = /^</.test(i) ? this.options.pedantic && !/>$/.test(e) ? i.slice(1) : i.slice(1, -1) : i) && i.replace(this.rules.inline._escapes, "$1"),
                            title: o && o.replace(this.rules.inline._escapes, "$1")
                        }, n[0])
                }
            }
            ,
            e.prototype.reflink = function (e, n) {
                if ((i = this.rules.inline.reflink.exec(e)) || (i = this.rules.inline.nolink.exec(e))) {
                    var e = (i[2] || i[1]).replace(/\s+/g, " ");
                    if ((e = n[e.toLowerCase()]) && e.href)
                        return en(i, e, i[0]);
                    var i = i[0].charAt(0);
                    return {
                        type: "text",
                        raw: i,
                        text: i
                    }
                }
            }
            ,
            e.prototype.strong = function (e, n, i) {
                void 0 === i && (i = "");
                var o = this.rules.inline.strong.start.exec(e);
                if (o && (!o[1] || o[1] && ("" === i || this.rules.inline.punctuation.exec(i)))) {
                    n = n.slice(-1 * e.length);
                    var t, a = "**" === o[0] ? this.rules.inline.strong.endAst : this.rules.inline.strong.endUnd;
                    for (a.lastIndex = 0; null != (o = a.exec(n));)
                        if (t = this.rules.inline.strong.middle.exec(n.slice(0, o.index + 3)))
                            return {
                                type: "strong",
                                raw: e.slice(0, t[0].length),
                                text: e.slice(2, t[0].length - 2)
                            }
                }
            }
            ,
            e.prototype.em = function (e, n, i) {
                void 0 === i && (i = "");
                var o = this.rules.inline.em.start.exec(e);
                if (o && (!o[1] || o[1] && ("" === i || this.rules.inline.punctuation.exec(i)))) {
                    n = n.slice(-1 * e.length);
                    var t, a = "*" === o[0] ? this.rules.inline.em.endAst : this.rules.inline.em.endUnd;
                    for (a.lastIndex = 0; null != (o = a.exec(n));)
                        if (t = this.rules.inline.em.middle.exec(n.slice(0, o.index + 2)))
                            return {
                                type: "em",
                                raw: e.slice(0, t[0].length),
                                text: e.slice(1, t[0].length - 1)
                            }
                }
            }
            ,
            e.prototype.codespan = function (e) {
                var n = this.rules.inline.code.exec(e);
                if (n) {
                    var i = n[2].replace(/\n/g, " ")
                        , o = /[^ ]/.test(i)
                        , e = /^ /.test(i) && / $/.test(i);
                    return o && e && (i = i.substring(1, i.length - 1)),
                        i = Je(i, !0),
                    {
                        type: "codespan",
                        raw: n[0],
                        text: i
                    }
                }
            }
            ,
            e.prototype.br = function (e) {
                e = this.rules.inline.br.exec(e);
                if (e)
                    return {
                        type: "br",
                        raw: e[0]
                    }
            }
            ,
            e.prototype.del = function (e) {
                e = this.rules.inline.del.exec(e);
                if (e)
                    return {
                        type: "del",
                        raw: e[0],
                        text: e[2]
                    }
            }
            ,
            e.prototype.autolink = function (e, n) {
                e = this.rules.inline.autolink.exec(e);
                if (e) {
                    var i, n = "@" === e[2] ? "mailto:" + (i = Je(this.options.mangle ? n(e[1]) : e[1])) : i = Je(e[1]);
                    return {
                        type: "link",
                        raw: e[0],
                        text: i,
                        href: n,
                        tokens: [{
                            type: "text",
                            raw: i,
                            text: i
                        }]
                    }
                }
            }
            ,
            e.prototype.url = function (e, n) {
                var i, o, t, a;
                if (i = this.rules.inline.url.exec(e)) {
                    if ("@" === i[2])
                        t = "mailto:" + (o = Je(this.options.mangle ? n(i[0]) : i[0]));
                    else {
                        for (; a = i[0],
                            i[0] = this.rules.inline._backpedal.exec(i[0])[0],
                            a !== i[0];)
                            ;
                        o = Je(i[0]),
                            t = "www." === i[1] ? "http://" + o : o
                    }
                    return {
                        type: "link",
                        raw: i[0],
                        text: o,
                        href: t,
                        tokens: [{
                            type: "text",
                            raw: o,
                            text: o
                        }]
                    }
                }
            }
            ,
            e.prototype.inlineText = function (e, n, i) {
                e = this.rules.inline.text.exec(e);
                if (e) {
                    i = n ? this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(e[0]) : Je(e[0]) : e[0] : Je(this.options.smartypants ? i(e[0]) : e[0]);
                    return {
                        type: "text",
                        raw: e[0],
                        text: i
                    }
                }
            }
            ,
            e
    }()
        , Ze = De
        , Ve = Ne
        , De = Ue
        , Ne = {
            newline: /^(?: *(?:\n|$))+/,
            code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
            fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
            hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
            heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
            blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
            list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?! {0,3}bull )\n*|\s*$)/,
            html: "^ {0,3}(?:<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$))",
            def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
            nptable: Ze,
            table: Ze,
            lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
            _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html| +\n)[^\n]+)*)/,
            text: /^[^\n]+/,
            _label: /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/,
            _title: /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/
        };
    Ne.def = Ve(Ne.def).replace("label", Ne._label).replace("title", Ne._title).getRegex(),
        Ne.bullet = /(?:[*+-]|\d{1,9}[.)])/,
        Ne.item = /^( *)(bull) ?[^\n]*(?:\n(?! *bull ?)[^\n]*)*/,
        Ne.item = Ve(Ne.item, "gm").replace(/bull/g, Ne.bullet).getRegex(),
        Ne.listItemStart = Ve(/^( *)(bull)/).replace("bull", Ne.bullet).getRegex(),
        Ne.list = Ve(Ne.list).replace(/bull/g, Ne.bullet).replace("hr", "\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))").replace("def", "\\n+(?=" + Ne.def.source + ")").getRegex(),
        Ne._tag = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",
        Ne._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/,
        Ne.html = Ve(Ne.html, "i").replace("comment", Ne._comment).replace("tag", Ne._tag).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),
        Ne.paragraph = Ve(Ne._paragraph).replace("hr", Ne.hr).replace("heading", " {0,3}#{1,6} ").replace("|lheading", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)").replace("tag", Ne._tag).getRegex(),
        Ne.blockquote = Ve(Ne.blockquote).replace("paragraph", Ne.paragraph).getRegex(),
        Ne.normal = De({}, Ne),
        Ne.gfm = De({}, Ne.normal, {
            nptable: "^ *([^|\\n ].*\\|.*)\\n {0,3}([-:]+ *\\|[-| :]*)(?:\\n((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)",
            table: "^ *\\|(.+)\\n {0,3}\\|?( *[-:]+[-| :]*)(?:\\n *((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
        }),
        Ne.gfm.nptable = Ve(Ne.gfm.nptable).replace("hr", Ne.hr).replace("heading", " {0,3}#{1,6} ").replace("blockquote", " {0,3}>").replace("code", " {4}[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)").replace("tag", Ne._tag).getRegex(),
        Ne.gfm.table = Ve(Ne.gfm.table).replace("hr", Ne.hr).replace("heading", " {0,3}#{1,6} ").replace("blockquote", " {0,3}>").replace("code", " {4}[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)").replace("tag", Ne._tag).getRegex(),
        Ne.pedantic = De({}, Ne.normal, {
            html: Ve("^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))").replace("comment", Ne._comment).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
            def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
            heading: /^(#{1,6})(.*)(?:\n+|$)/,
            fences: Ze,
            paragraph: Ve(Ne.normal._paragraph).replace("hr", Ne.hr).replace("heading", " *#{1,6} *[^\n]").replace("lheading", Ne.lheading).replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").getRegex()
        });
    Ze = {
        escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
        autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
        url: Ze,
        tag: "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",
        link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
        reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
        nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
        reflinkSearch: "reflink|nolink(?!\\()",
        strong: {
            start: /^(?:(\*\*(?=[*punctuation]))|\*\*)(?![\s])|__/,
            middle: /^\*\*(?:(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)|\*(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)*?\*)+?\*\*$|^__(?![\s])((?:(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)|_(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)*?_)+?)__$/,
            endAst: /[^punctuation\s]\*\*(?!\*)|[punctuation]\*\*(?!\*)(?:(?=[punctuation_\s]|$))/,
            endUnd: /[^\s]__(?!_)(?:(?=[punctuation*\s])|$)/
        },
        em: {
            start: /^(?:(\*(?=[punctuation]))|\*)(?![*\s])|_/,
            middle: /^\*(?:(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)|\*(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)*?\*)+?\*$|^_(?![_\s])(?:(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)|_(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)*?_)+?_$/,
            endAst: /[^punctuation\s]\*(?!\*)|[punctuation]\*(?!\*)(?:(?=[punctuation_\s]|$))/,
            endUnd: /[^\s]_(?!_)(?:(?=[punctuation*\s])|$)/
        },
        code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
        br: /^( {2,}|\\)\n(?!\s*$)/,
        del: Ze,
        text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n)))/,
        punctuation: /^([\s*punctuation])/,
        _punctuation: "!\"#$%&'()+\\-.,/:;<=>?@\\[\\]`^{|}~"
    };
    Ze.punctuation = Ve(Ze.punctuation).replace(/punctuation/g, Ze._punctuation).getRegex(),
        Ze._blockSkip = "\\[[^\\]]*?\\]\\([^\\)]*?\\)|`[^`]*?`|<[^>]*?>",
        Ze._overlapSkip = "__[^_]*?__|\\*\\*\\[^\\*\\]*?\\*\\*",
        Ze._comment = Ve(Ne._comment).replace("(?:--\x3e|$)", "--\x3e").getRegex(),
        Ze.em.start = Ve(Ze.em.start).replace(/punctuation/g, Ze._punctuation).getRegex(),
        Ze.em.middle = Ve(Ze.em.middle).replace(/punctuation/g, Ze._punctuation).replace(/overlapSkip/g, Ze._overlapSkip).getRegex(),
        Ze.em.endAst = Ve(Ze.em.endAst, "g").replace(/punctuation/g, Ze._punctuation).getRegex(),
        Ze.em.endUnd = Ve(Ze.em.endUnd, "g").replace(/punctuation/g, Ze._punctuation).getRegex(),
        Ze.strong.start = Ve(Ze.strong.start).replace(/punctuation/g, Ze._punctuation).getRegex(),
        Ze.strong.middle = Ve(Ze.strong.middle).replace(/punctuation/g, Ze._punctuation).replace(/overlapSkip/g, Ze._overlapSkip).getRegex(),
        Ze.strong.endAst = Ve(Ze.strong.endAst, "g").replace(/punctuation/g, Ze._punctuation).getRegex(),
        Ze.strong.endUnd = Ve(Ze.strong.endUnd, "g").replace(/punctuation/g, Ze._punctuation).getRegex(),
        Ze.blockSkip = Ve(Ze._blockSkip, "g").getRegex(),
        Ze.overlapSkip = Ve(Ze._overlapSkip, "g").getRegex(),
        Ze._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g,
        Ze._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/,
        Ze._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/,
        Ze.autolink = Ve(Ze.autolink).replace("scheme", Ze._scheme).replace("email", Ze._email).getRegex(),
        Ze._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/,
        Ze.tag = Ve(Ze.tag).replace("comment", Ze._comment).replace("attribute", Ze._attribute).getRegex(),
        Ze._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,
        Ze._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/,
        Ze._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/,
        Ze.link = Ve(Ze.link).replace("label", Ze._label).replace("href", Ze._href).replace("title", Ze._title).getRegex(),
        Ze.reflink = Ve(Ze.reflink).replace("label", Ze._label).getRegex(),
        Ze.reflinkSearch = Ve(Ze.reflinkSearch, "g").replace("reflink", Ze.reflink).replace("nolink", Ze.nolink).getRegex(),
        Ze.normal = De({}, Ze),
        Ze.pedantic = De({}, Ze.normal, {
            strong: {
                start: /^__|\*\*/,
                middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
                endAst: /\*\*(?!\*)/g,
                endUnd: /__(?!_)/g
            },
            em: {
                start: /^_|\*/,
                middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
                endAst: /\*(?!\*)/g,
                endUnd: /_(?!_)/g
            },
            link: Ve(/^!?\[(label)\]\((.*?)\)/).replace("label", Ze._label).getRegex(),
            reflink: Ve(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Ze._label).getRegex()
        }),
        Ze.gfm = De({}, Ze.normal, {
            escape: Ve(Ze.escape).replace("])", "~|])").getRegex(),
            _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
            url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
            _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
            del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
            text: /^([`~]+|[^`~])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/
        }),
        Ze.gfm.url = Ve(Ze.gfm.url, "i").replace("email", Ze.gfm._extended_email).getRegex(),
        Ze.breaks = De({}, Ze.gfm, {
            br: Ve(Ze.br).replace("{2,}", "*").getRegex(),
            text: Ve(Ze.gfm.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
        });
    var Ze = {
        block: Ne,
        inline: Ze
    }
        , on = we.defaults
        , tn = Ze.block
        , an = Ze.inline
        , rn = Ge;
    function cn(e) {
        return e.replace(/---/g, "—").replace(/--/g, "–").replace(/(^|[-\u2014/(\[{"\s])'/g, "$1‘").replace(/'/g, "’").replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1“").replace(/"/g, "”").replace(/\.{3}/g, "…")
    }
    function un(e) {
        for (var n, i = "", o = e.length, t = 0; t < o; t++)
            n = e.charCodeAt(t),
                i += "&#" + (n = .5 < Math.random() ? "x" + n.toString(16) : n) + ";";
        return i
    }
    var fn = function () {
        function i(e) {
            this.tokens = [],
                this.tokens.links = Object.create(null),
                this.options = e || on,
                this.options.tokenizer = this.options.tokenizer || new nn,
                this.tokenizer = this.options.tokenizer,
                this.tokenizer.options = this.options;
            e = {
                block: tn.normal,
                inline: an.normal
            };
            this.options.pedantic ? (e.block = tn.pedantic,
                e.inline = an.pedantic) : this.options.gfm && (e.block = tn.gfm,
                    this.options.breaks ? e.inline = an.breaks : e.inline = an.gfm),
                this.tokenizer.rules = e
        }
        var e = {
            rules: {
                configurable: !0
            }
        };
        return e.rules.get = function () {
            return {
                block: tn,
                inline: an
            }
        }
            ,
            i.lex = function (e, n) {
                return new i(n).lex(e)
            }
            ,
            i.lexInline = function (e, n) {
                return new i(n).inlineTokens(e)
            }
            ,
            i.prototype.lex = function (e) {
                return e = e.replace(/\r\n|\r/g, "\n").replace(/\t/g, "    "),
                    this.blockTokens(e, this.tokens, !0),
                    this.inline(this.tokens),
                    this.tokens
            }
            ,
            i.prototype.blockTokens = function (e, n, i) {
                var o, t, a, r;
                for (void 0 === n && (n = []),
                    void 0 === i && (i = !0),
                    this.options.pedantic && (e = e.replace(/^ +$/gm, "")); e;)
                    if (o = this.tokenizer.space(e))
                        e = e.substring(o.raw.length),
                            o.type && n.push(o);
                    else if (o = this.tokenizer.code(e, n))
                        e = e.substring(o.raw.length),
                            o.type ? n.push(o) : ((r = n[n.length - 1]).raw += "\n" + o.raw,
                                r.text += "\n" + o.text);
                    else if (o = this.tokenizer.fences(e))
                        e = e.substring(o.raw.length),
                            n.push(o);
                    else if (o = this.tokenizer.heading(e))
                        e = e.substring(o.raw.length),
                            n.push(o);
                    else if (o = this.tokenizer.nptable(e))
                        e = e.substring(o.raw.length),
                            n.push(o);
                    else if (o = this.tokenizer.hr(e))
                        e = e.substring(o.raw.length),
                            n.push(o);
                    else if (o = this.tokenizer.blockquote(e))
                        e = e.substring(o.raw.length),
                            o.tokens = this.blockTokens(o.text, [], i),
                            n.push(o);
                    else if (o = this.tokenizer.list(e)) {
                        for (e = e.substring(o.raw.length),
                            a = o.items.length,
                            t = 0; t < a; t++)
                            o.items[t].tokens = this.blockTokens(o.items[t].text, [], !1);
                        n.push(o)
                    } else if (o = this.tokenizer.html(e))
                        e = e.substring(o.raw.length),
                            n.push(o);
                    else if (i && (o = this.tokenizer.def(e)))
                        e = e.substring(o.raw.length),
                            this.tokens.links[o.tag] || (this.tokens.links[o.tag] = {
                                href: o.href,
                                title: o.title
                            });
                    else if (o = this.tokenizer.table(e))
                        e = e.substring(o.raw.length),
                            n.push(o);
                    else if (o = this.tokenizer.lheading(e))
                        e = e.substring(o.raw.length),
                            n.push(o);
                    else if (i && (o = this.tokenizer.paragraph(e)))
                        e = e.substring(o.raw.length),
                            n.push(o);
                    else if (o = this.tokenizer.text(e, n))
                        e = e.substring(o.raw.length),
                            o.type ? n.push(o) : ((r = n[n.length - 1]).raw += "\n" + o.raw,
                                r.text += "\n" + o.text);
                    else if (e) {
                        var c = "Infinite loop on byte: " + e.charCodeAt(0);
                        if (this.options.silent) {
                            console.error(c);
                            break
                        }
                        throw new Error(c)
                    }
                return n
            }
            ,
            i.prototype.inline = function (e) {
                for (var n, i, o, t, a, r = e.length, c = 0; c < r; c++)
                    switch ((a = e[c]).type) {
                        case "paragraph":
                        case "text":
                        case "heading":
                            a.tokens = [],
                                this.inlineTokens(a.text, a.tokens);
                            break;
                        case "table":
                            for (a.tokens = {
                                header: [],
                                cells: []
                            },
                                o = a.header.length,
                                n = 0; n < o; n++)
                                a.tokens.header[n] = [],
                                    this.inlineTokens(a.header[n], a.tokens.header[n]);
                            for (o = a.cells.length,
                                n = 0; n < o; n++)
                                for (t = a.cells[n],
                                    a.tokens.cells[n] = [],
                                    i = 0; i < t.length; i++)
                                    a.tokens.cells[n][i] = [],
                                        this.inlineTokens(t[i], a.tokens.cells[n][i]);
                            break;
                        case "blockquote":
                            this.inline(a.tokens);
                            break;
                        case "list":
                            for (o = a.items.length,
                                n = 0; n < o; n++)
                                this.inline(a.items[n].tokens)
                    }
                return e
            }
            ,
            i.prototype.inlineTokens = function (e, n, i, o) {
                var t;
                void 0 === n && (n = []),
                    void 0 === i && (i = !1),
                    void 0 === o && (o = !1);
                var a, r, c, u = e;
                if (this.tokens.links) {
                    var f = Object.keys(this.tokens.links);
                    if (0 < f.length)
                        for (; null != (a = this.tokenizer.rules.inline.reflinkSearch.exec(u));)
                            f.includes(a[0].slice(a[0].lastIndexOf("[") + 1, -1)) && (u = u.slice(0, a.index) + "[" + rn("a", a[0].length - 2) + "]" + u.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))
                }
                for (; null != (a = this.tokenizer.rules.inline.blockSkip.exec(u));)
                    u = u.slice(0, a.index) + "[" + rn("a", a[0].length - 2) + "]" + u.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
                for (; e;)
                    if (r || (c = ""),
                        r = !1,
                        t = this.tokenizer.escape(e))
                        e = e.substring(t.raw.length),
                            n.push(t);
                    else if (t = this.tokenizer.tag(e, i, o))
                        e = e.substring(t.raw.length),
                            i = t.inLink,
                            o = t.inRawBlock,
                            n.push(t);
                    else if (t = this.tokenizer.link(e))
                        e = e.substring(t.raw.length),
                            "link" === t.type && (t.tokens = this.inlineTokens(t.text, [], !0, o)),
                            n.push(t);
                    else if (t = this.tokenizer.reflink(e, this.tokens.links))
                        e = e.substring(t.raw.length),
                            "link" === t.type && (t.tokens = this.inlineTokens(t.text, [], !0, o)),
                            n.push(t);
                    else if (t = this.tokenizer.strong(e, u, c))
                        e = e.substring(t.raw.length),
                            t.tokens = this.inlineTokens(t.text, [], i, o),
                            n.push(t);
                    else if (t = this.tokenizer.em(e, u, c))
                        e = e.substring(t.raw.length),
                            t.tokens = this.inlineTokens(t.text, [], i, o),
                            n.push(t);
                    else if (t = this.tokenizer.codespan(e))
                        e = e.substring(t.raw.length),
                            n.push(t);
                    else if (t = this.tokenizer.br(e))
                        e = e.substring(t.raw.length),
                            n.push(t);
                    else if (t = this.tokenizer.del(e))
                        e = e.substring(t.raw.length),
                            t.tokens = this.inlineTokens(t.text, [], i, o),
                            n.push(t);
                    else if (t = this.tokenizer.autolink(e, un))
                        e = e.substring(t.raw.length),
                            n.push(t);
                    else if (i || !(t = this.tokenizer.url(e, un))) {
                        if (t = this.tokenizer.inlineText(e, o, cn))
                            e = e.substring(t.raw.length),
                                c = t.raw.slice(-1),
                                r = !0,
                                n.push(t);
                        else if (e) {
                            var p = "Infinite loop on byte: " + e.charCodeAt(0);
                            if (this.options.silent) {
                                console.error(p);
                                break
                            }
                            throw new Error(p)
                        }
                    } else
                        e = e.substring(t.raw.length),
                            n.push(t);
                return n
            }
            ,
            Object.defineProperties(i, e),
            i
    }()
        , pn = we.defaults
        , dn = He
        , gn = Me
        , sn = function () {
            function e(e) {
                this.options = e || pn
            }
            return e.prototype.code = function (e, n, i) {
                var o = (n || "").match(/\S*/)[0];
                return !this.options.highlight || null != (n = this.options.highlight(e, o)) && n !== e && (i = !0,
                    e = n),
                    e = e.replace(/\n$/, "") + "\n",
                    o ? '<pre><code class="' + this.options.langPrefix + gn(o, !0) + '">' + (i ? e : gn(e, !0)) + "</code></pre>\n" : "<pre><code>" + (i ? e : gn(e, !0)) + "</code></pre>\n"
            }
                ,
                e.prototype.blockquote = function (e) {
                    return "<blockquote>\n" + e + "</blockquote>\n"
                }
                ,
                e.prototype.html = function (e) {
                    return e
                }
                ,
                e.prototype.heading = function (e, n, i, o) {
                    return this.options.headerIds ? "<h" + n + ' id="' + this.options.headerPrefix + o.slug(i) + '">' + e + "</h" + n + ">\n" : "<h" + n + ">" + e + "</h" + n + ">\n"
                }
                ,
                e.prototype.hr = function () {
                    return this.options.xhtml ? "<hr/>\n" : "<hr>\n"
                }
                ,
                e.prototype.list = function (e, n, i) {
                    var o = n ? "ol" : "ul";
                    return "<" + o + (n && 1 !== i ? ' start="' + i + '"' : "") + ">\n" + e + "</" + o + ">\n"
                }
                ,
                e.prototype.listitem = function (e) {
                    return "<li>" + e + "</li>\n"
                }
                ,
                e.prototype.checkbox = function (e) {
                    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"' + (this.options.xhtml ? " /" : "") + "> "
                }
                ,
                e.prototype.paragraph = function (e) {
                    return "<p>" + e + "</p>\n"
                }
                ,
                e.prototype.table = function (e, n) {
                    return "<table>\n<thead>\n" + e + "</thead>\n" + (n = n && "<tbody>" + n + "</tbody>") + "</table>\n"
                }
                ,
                e.prototype.tablerow = function (e) {
                    return "<tr>\n" + e + "</tr>\n"
                }
                ,
                e.prototype.tablecell = function (e, n) {
                    var i = n.header ? "th" : "td";
                    return (n.align ? "<" + i + ' align="' + n.align + '">' : "<" + i + ">") + e + "</" + i + ">\n"
                }
                ,
                e.prototype.strong = function (e) {
                    return "<strong>" + e + "</strong>"
                }
                ,
                e.prototype.em = function (e) {
                    return "<em>" + e + "</em>"
                }
                ,
                e.prototype.codespan = function (e) {
                    return "<code>" + e + "</code>"
                }
                ,
                e.prototype.br = function () {
                    return this.options.xhtml ? "<br/>" : "<br>"
                }
                ,
                e.prototype.del = function (e) {
                    return "<del>" + e + "</del>"
                }
                ,
                e.prototype.link = function (e, n, i) {
                    if (null === (e = dn(this.options.sanitize, this.options.baseUrl, e)))
                        return i;
                    e = '<a href="' + gn(e) + '"';
                    return n && (e += ' title="' + n + '"'),
                        e += ">" + i + "</a>"
                }
                ,
                e.prototype.image = function (e, n, i) {
                    if (null === (e = dn(this.options.sanitize, this.options.baseUrl, e)))
                        return i;
                    i = '<img src="' + e + '" alt="' + i + '"';
                    return n && (i += ' title="' + n + '"'),
                        i += this.options.xhtml ? "/>" : ">"
                }
                ,
                e.prototype.text = function (e) {
                    return e
                }
                ,
                e
        }()
        , ln = function () {
            function e() { }
            return e.prototype.strong = function (e) {
                return e
            }
                ,
                e.prototype.em = function (e) {
                    return e
                }
                ,
                e.prototype.codespan = function (e) {
                    return e
                }
                ,
                e.prototype.del = function (e) {
                    return e
                }
                ,
                e.prototype.html = function (e) {
                    return e
                }
                ,
                e.prototype.text = function (e) {
                    return e
                }
                ,
                e.prototype.link = function (e, n, i) {
                    return "" + i
                }
                ,
                e.prototype.image = function (e, n, i) {
                    return "" + i
                }
                ,
                e.prototype.br = function () {
                    return ""
                }
                ,
                e
        }()
        , vn = function () {
            function e() {
                this.seen = {}
            }
            return e.prototype.serialize = function (e) {
                return e.toLowerCase().trim().replace(/<[!\/a-z].*?>/gi, "").replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, "").replace(/\s/g, "-")
            }
                ,
                e.prototype.getNextSafeSlug = function (e, n) {
                    var i = e
                        , o = 0;
                    if (this.seen.hasOwnProperty(i))
                        for (o = this.seen[e]; i = e + "-" + ++o,
                            this.seen.hasOwnProperty(i);)
                            ;
                    return n || (this.seen[e] = o,
                        this.seen[i] = 0),
                        i
                }
                ,
                e.prototype.slug = function (e, n) {
                    void 0 === n && (n = {});
                    e = this.serialize(e);
                    return this.getNextSafeSlug(e, n.dryrun)
                }
                ,
                e
        }()
        , hn = we.defaults
        , _n = Ie
        , mn = function () {
            function i(e) {
                this.options = e || hn,
                    this.options.renderer = this.options.renderer || new sn,
                    this.renderer = this.options.renderer,
                    this.renderer.options = this.options,
                    this.textRenderer = new ln,
                    this.slugger = new vn
            }
            return i.parse = function (e, n) {
                return new i(n).parse(e)
            }
                ,
                i.parseInline = function (e, n) {
                    return new i(n).parseInline(e)
                }
                ,
                i.prototype.parse = function (e, n) {
                    void 0 === n && (n = !0);
                    for (var i, o, t, a, r, c, u, f, p, d, g, s, l, v, h, _ = "", m = e.length, b = 0; b < m; b++)
                        switch ((f = e[b]).type) {
                            case "space":
                                continue;
                            case "hr":
                                _ += this.renderer.hr();
                                continue;
                            case "heading":
                                _ += this.renderer.heading(this.parseInline(f.tokens), f.depth, _n(this.parseInline(f.tokens, this.textRenderer)), this.slugger);
                                continue;
                            case "code":
                                _ += this.renderer.code(f.text, f.lang, f.escaped);
                                continue;
                            case "table":
                                for (c = p = "",
                                    t = f.header.length,
                                    i = 0; i < t; i++)
                                    c += this.renderer.tablecell(this.parseInline(f.tokens.header[i]), {
                                        header: !0,
                                        align: f.align[i]
                                    });
                                for (p += this.renderer.tablerow(c),
                                    u = "",
                                    t = f.cells.length,
                                    i = 0; i < t; i++) {
                                    for (c = "",
                                        a = (r = f.tokens.cells[i]).length,
                                        o = 0; o < a; o++)
                                        c += this.renderer.tablecell(this.parseInline(r[o]), {
                                            header: !1,
                                            align: f.align[o]
                                        });
                                    u += this.renderer.tablerow(c)
                                }
                                _ += this.renderer.table(p, u);
                                continue;
                            case "blockquote":
                                u = this.parse(f.tokens),
                                    _ += this.renderer.blockquote(u);
                                continue;
                            case "list":
                                for (p = f.ordered,
                                    k = f.start,
                                    d = f.loose,
                                    t = f.items.length,
                                    u = "",
                                    i = 0; i < t; i++)
                                    l = (s = f.items[i]).checked,
                                        v = s.task,
                                        g = "",
                                        s.task && (h = this.renderer.checkbox(l),
                                            d ? 0 < s.tokens.length && "text" === s.tokens[0].type ? (s.tokens[0].text = h + " " + s.tokens[0].text,
                                                s.tokens[0].tokens && 0 < s.tokens[0].tokens.length && "text" === s.tokens[0].tokens[0].type && (s.tokens[0].tokens[0].text = h + " " + s.tokens[0].tokens[0].text)) : s.tokens.unshift({
                                                    type: "text",
                                                    text: h
                                                }) : g += h),
                                        g += this.parse(s.tokens, d),
                                        u += this.renderer.listitem(g, v, l);
                                _ += this.renderer.list(u, p, k);
                                continue;
                            case "html":
                                _ += this.renderer.html(f.text);
                                continue;
                            case "paragraph":
                                _ += this.renderer.paragraph(this.parseInline(f.tokens));
                                continue;
                            case "text":
                                for (u = f.tokens ? this.parseInline(f.tokens) : f.text; b + 1 < m && "text" === e[b + 1].type;)
                                    u += "\n" + ((f = e[++b]).tokens ? this.parseInline(f.tokens) : f.text);
                                _ += n ? this.renderer.paragraph(u) : u;
                                continue;
                            default:
                                var k = 'Token with "' + f.type + '" type was not found.';
                                if (this.options.silent)
                                    return void console.error(k);
                                throw new Error(k)
                        }
                    return _
                }
                ,
                i.prototype.parseInline = function (e, n) {
                    n = n || this.renderer;
                    for (var i, o = "", t = e.length, a = 0; a < t; a++)
                        switch ((i = e[a]).type) {
                            case "escape":
                                o += n.text(i.text);
                                break;
                            case "html":
                                o += n.html(i.text);
                                break;
                            case "link":
                                o += n.link(i.href, i.title, this.parseInline(i.tokens, n));
                                break;
                            case "image":
                                o += n.image(i.href, i.title, i.text);
                                break;
                            case "strong":
                                o += n.strong(this.parseInline(i.tokens, n));
                                break;
                            case "em":
                                o += n.em(this.parseInline(i.tokens, n));
                                break;
                            case "codespan":
                                o += n.codespan(i.text);
                                break;
                            case "br":
                                o += n.br();
                                break;
                            case "del":
                                o += n.del(this.parseInline(i.tokens, n));
                                break;
                            case "text":
                                o += n.text(i.text);
                                break;
                            default:
                                var r = 'Token with "' + i.type + '" type was not found.';
                                if (this.options.silent)
                                    return void console.error(r);
                                throw new Error(r)
                        }
                    return o
                }
                ,
                i
        }()
        , bn = Ue
        , kn = Ye
        , wn = Me
        , Me = we.getDefaults
        , yn = we.changeDefaults
        , we = we.defaults;
    function xn(e, i, o) {
        if (null == e)
            throw new Error("marked(): input parameter is undefined or null");
        if ("string" != typeof e)
            throw new Error("marked(): input parameter is of type " + Object.prototype.toString.call(e) + ", string expected");
        if ("function" == typeof i && (o = i,
            i = null),
            i = bn({}, xn.defaults, i || {}),
            kn(i),
            o) {
            var t, a = i.highlight;
            try {
                t = fn.lex(e, i)
            } catch (e) {
                return o(e)
            }
            function r(n) {
                var e;
                if (!n)
                    try {
                        e = mn.parse(t, i)
                    } catch (e) {
                        n = e
                    }
                return i.highlight = a,
                    n ? o(n) : o(null, e)
            }
            if (!a || a.length < 3)
                return r();
            if (delete i.highlight,
                !t.length)
                return r();
            var c = 0;
            return xn.walkTokens(t, function (i) {
                "code" === i.type && (c++,
                    setTimeout(function () {
                        a(i.text, i.lang, function (e, n) {
                            return e ? r(e) : (null != n && n !== i.text && (i.text = n,
                                i.escaped = !0),
                                void (0 === --c && r()))
                        })
                    }, 0))
            }),
                void (0 === c && r())
        }
        try {
            var n = fn.lex(e, i);
            return i.walkTokens && xn.walkTokens(n, i.walkTokens),
                mn.parse(n, i)
        } catch (e) {
            if (e.message += "\nPlease report this to https://github.com/markedjs/marked.",
                i.silent)
                return "<p>An error occurred:</p><pre>" + wn(e.message + "", !0) + "</pre>";
            throw e
        }
    }
    xn.options = xn.setOptions = function (e) {
        return bn(xn.defaults, e),
            yn(xn.defaults),
            xn
    }
        ,
        xn.getDefaults = Me,
        xn.defaults = we,
        xn.use = function (a) {
            var n, e = bn({}, a);
            if (a.renderer) {
                var i, r = xn.defaults.renderer || new sn;
                for (i in a.renderer)
                    !function (o) {
                        var t = r[o];
                        r[o] = function () {
                            for (var e = [], n = arguments.length; n--;)
                                e[n] = arguments[n];
                            var i = a.renderer[o].apply(r, e);
                            return i = !1 === i ? t.apply(r, e) : i
                        }
                    }(i);
                e.renderer = r
            }
            if (a.tokenizer) {
                var t, c = xn.defaults.tokenizer || new nn;
                for (t in a.tokenizer)
                    !function () {
                        var o = c[t];
                        c[t] = function () {
                            for (var e = [], n = arguments.length; n--;)
                                e[n] = arguments[n];
                            var i = a.tokenizer[t].apply(c, e);
                            return i = !1 === i ? o.apply(c, e) : i
                        }
                    }();
                e.tokenizer = c
            }
            a.walkTokens && (n = xn.defaults.walkTokens,
                e.walkTokens = function (e) {
                    a.walkTokens(e),
                        n && n(e)
                }
            ),
                xn.setOptions(e)
        }
        ,
        xn.walkTokens = function (e, n) {
            for (var i = 0, o = e; i < o.length; i += 1) {
                var t = o[i];
                switch (n(t),
                t.type) {
                    case "table":
                        for (var a = 0, r = t.tokens.header; a < r.length; a += 1) {
                            var c = r[a];
                            xn.walkTokens(c, n)
                        }
                        for (var u = 0, f = t.tokens.cells; u < f.length; u += 1)
                            for (var p = 0, d = f[u]; p < d.length; p += 1) {
                                var g = d[p];
                                xn.walkTokens(g, n)
                            }
                        break;
                    case "list":
                        xn.walkTokens(t.items, n);
                        break;
                    default:
                        t.tokens && xn.walkTokens(t.tokens, n)
                }
            }
        }
        ,
        xn.parseInline = function (e, n) {
            if (null == e)
                throw new Error("marked.parseInline(): input parameter is undefined or null");
            if ("string" != typeof e)
                throw new Error("marked.parseInline(): input parameter is of type " + Object.prototype.toString.call(e) + ", string expected");
            n = bn({}, xn.defaults, n || {}),
                kn(n);
            try {
                var i = fn.lexInline(e, n);
                return n.walkTokens && xn.walkTokens(i, n.walkTokens),
                    mn.parseInline(i, n)
            } catch (e) {
                if (e.message += "\nPlease report this to https://github.com/markedjs/marked.",
                    n.silent)
                    return "<p>An error occurred:</p><pre>" + wn(e.message + "", !0) + "</pre>";
                throw e
            }
        }
        ,
        xn.Parser = mn,
        xn.parser = mn.parse,
        xn.Renderer = sn,
        xn.TextRenderer = ln,
        xn.Lexer = fn,
        xn.lexer = fn.lex,
        xn.Tokenizer = nn,
        xn.Slugger = vn;
    var Sn = xn.parse = xn;
    function An(e, i) {
        if (void 0 === i && (i = '<ul class="app-sub-sidebar">{inner}</ul>'),
            !e || !e.length)
            return "";
        var o = "";
        return e.forEach(function (e) {
            var n = e.title.replace(/(<([^>]+)>)/g, "");
            o += '<li><a class="section-link" href="' + e.slug + '" title="' + n + '">' + e.title + "</a></li>",
                e.children && (o += An(e.children, i))
        }),
            i.replace("{inner}", o)
    }
    function $n(e, n) {
        return '<p class="' + e + '">' + n.slice(5).trim() + "</p>"
    }
    function zn(e, o) {
        var t = []
            , a = {};
        return e.forEach(function (e) {
            var n = e.level || 1
                , i = n - 1;
            o < n || (a[i] ? a[i].children = (a[i].children || []).concat(e) : t.push(e),
                a[n] = e)
        }),
            t
    }
    var Fn = {}
        , En = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g;
    function Rn(e) {
        return e.toLowerCase()
    }
    function Tn(e) {
        if ("string" != typeof e)
            return "";
        var n = e.trim().replace(/[A-Z]+/g, Rn).replace(/<[^>]+>/g, "").replace(En, "").replace(/\s/g, "-").replace(/-+/g, "-").replace(/^(\d)/, "_$1")
            , e = Fn[n]
            , e = u.call(Fn, n) ? e + 1 : 0;
        return n = (Fn[n] = e) ? n + "-" + e : n
    }
    Tn.clear = function () {
        Fn = {}
    }
        ;
    var Cn = {
        baseURL: "https://github.githubassets.com/images/icons/emoji/",
        data: {
            100: "unicode/1f4af.png?v8",
            1234: "unicode/1f522.png?v8",
            "+1": "unicode/1f44d.png?v8",
            "-1": "unicode/1f44e.png?v8",
            "1st_place_medal": "unicode/1f947.png?v8",
            "2nd_place_medal": "unicode/1f948.png?v8",
            "3rd_place_medal": "unicode/1f949.png?v8",
            "8ball": "unicode/1f3b1.png?v8",
            a: "unicode/1f170.png?v8",
            ab: "unicode/1f18e.png?v8",
            abacus: "unicode/1f9ee.png?v8",
            abc: "unicode/1f524.png?v8",
            abcd: "unicode/1f521.png?v8",
            accept: "unicode/1f251.png?v8",
            accessibility: "accessibility.png?v8",
            accordion: "unicode/1fa97.png?v8",
            adhesive_bandage: "unicode/1fa79.png?v8",
            adult: "unicode/1f9d1.png?v8",
            aerial_tramway: "unicode/1f6a1.png?v8",
            afghanistan: "unicode/1f1e6-1f1eb.png?v8",
            airplane: "unicode/2708.png?v8",
            aland_islands: "unicode/1f1e6-1f1fd.png?v8",
            alarm_clock: "unicode/23f0.png?v8",
            albania: "unicode/1f1e6-1f1f1.png?v8",
            alembic: "unicode/2697.png?v8",
            algeria: "unicode/1f1e9-1f1ff.png?v8",
            alien: "unicode/1f47d.png?v8",
            ambulance: "unicode/1f691.png?v8",
            american_samoa: "unicode/1f1e6-1f1f8.png?v8",
            amphora: "unicode/1f3fa.png?v8",
            anatomical_heart: "unicode/1fac0.png?v8",
            anchor: "unicode/2693.png?v8",
            andorra: "unicode/1f1e6-1f1e9.png?v8",
            angel: "unicode/1f47c.png?v8",
            anger: "unicode/1f4a2.png?v8",
            angola: "unicode/1f1e6-1f1f4.png?v8",
            angry: "unicode/1f620.png?v8",
            anguilla: "unicode/1f1e6-1f1ee.png?v8",
            anguished: "unicode/1f627.png?v8",
            ant: "unicode/1f41c.png?v8",
            antarctica: "unicode/1f1e6-1f1f6.png?v8",
            antigua_barbuda: "unicode/1f1e6-1f1ec.png?v8",
            apple: "unicode/1f34e.png?v8",
            aquarius: "unicode/2652.png?v8",
            argentina: "unicode/1f1e6-1f1f7.png?v8",
            aries: "unicode/2648.png?v8",
            armenia: "unicode/1f1e6-1f1f2.png?v8",
            arrow_backward: "unicode/25c0.png?v8",
            arrow_double_down: "unicode/23ec.png?v8",
            arrow_double_up: "unicode/23eb.png?v8",
            arrow_down: "unicode/2b07.png?v8",
            arrow_down_small: "unicode/1f53d.png?v8",
            arrow_forward: "unicode/25b6.png?v8",
            arrow_heading_down: "unicode/2935.png?v8",
            arrow_heading_up: "unicode/2934.png?v8",
            arrow_left: "unicode/2b05.png?v8",
            arrow_lower_left: "unicode/2199.png?v8",
            arrow_lower_right: "unicode/2198.png?v8",
            arrow_right: "unicode/27a1.png?v8",
            arrow_right_hook: "unicode/21aa.png?v8",
            arrow_up: "unicode/2b06.png?v8",
            arrow_up_down: "unicode/2195.png?v8",
            arrow_up_small: "unicode/1f53c.png?v8",
            arrow_upper_left: "unicode/2196.png?v8",
            arrow_upper_right: "unicode/2197.png?v8",
            arrows_clockwise: "unicode/1f503.png?v8",
            arrows_counterclockwise: "unicode/1f504.png?v8",
            art: "unicode/1f3a8.png?v8",
            articulated_lorry: "unicode/1f69b.png?v8",
            artificial_satellite: "unicode/1f6f0.png?v8",
            artist: "unicode/1f9d1-1f3a8.png?v8",
            aruba: "unicode/1f1e6-1f1fc.png?v8",
            ascension_island: "unicode/1f1e6-1f1e8.png?v8",
            asterisk: "unicode/002a-20e3.png?v8",
            astonished: "unicode/1f632.png?v8",
            astronaut: "unicode/1f9d1-1f680.png?v8",
            athletic_shoe: "unicode/1f45f.png?v8",
            atm: "unicode/1f3e7.png?v8",
            atom: "atom.png?v8",
            atom_symbol: "unicode/269b.png?v8",
            australia: "unicode/1f1e6-1f1fa.png?v8",
            austria: "unicode/1f1e6-1f1f9.png?v8",
            auto_rickshaw: "unicode/1f6fa.png?v8",
            avocado: "unicode/1f951.png?v8",
            axe: "unicode/1fa93.png?v8",
            azerbaijan: "unicode/1f1e6-1f1ff.png?v8",
            b: "unicode/1f171.png?v8",
            baby: "unicode/1f476.png?v8",
            baby_bottle: "unicode/1f37c.png?v8",
            baby_chick: "unicode/1f424.png?v8",
            baby_symbol: "unicode/1f6bc.png?v8",
            back: "unicode/1f519.png?v8",
            bacon: "unicode/1f953.png?v8",
            badger: "unicode/1f9a1.png?v8",
            badminton: "unicode/1f3f8.png?v8",
            bagel: "unicode/1f96f.png?v8",
            baggage_claim: "unicode/1f6c4.png?v8",
            baguette_bread: "unicode/1f956.png?v8",
            bahamas: "unicode/1f1e7-1f1f8.png?v8",
            bahrain: "unicode/1f1e7-1f1ed.png?v8",
            balance_scale: "unicode/2696.png?v8",
            bald_man: "unicode/1f468-1f9b2.png?v8",
            bald_woman: "unicode/1f469-1f9b2.png?v8",
            ballet_shoes: "unicode/1fa70.png?v8",
            balloon: "unicode/1f388.png?v8",
            ballot_box: "unicode/1f5f3.png?v8",
            ballot_box_with_check: "unicode/2611.png?v8",
            bamboo: "unicode/1f38d.png?v8",
            banana: "unicode/1f34c.png?v8",
            bangbang: "unicode/203c.png?v8",
            bangladesh: "unicode/1f1e7-1f1e9.png?v8",
            banjo: "unicode/1fa95.png?v8",
            bank: "unicode/1f3e6.png?v8",
            bar_chart: "unicode/1f4ca.png?v8",
            barbados: "unicode/1f1e7-1f1e7.png?v8",
            barber: "unicode/1f488.png?v8",
            baseball: "unicode/26be.png?v8",
            basecamp: "basecamp.png?v8",
            basecampy: "basecampy.png?v8",
            basket: "unicode/1f9fa.png?v8",
            basketball: "unicode/1f3c0.png?v8",
            basketball_man: "unicode/26f9-2642.png?v8",
            basketball_woman: "unicode/26f9-2640.png?v8",
            bat: "unicode/1f987.png?v8",
            bath: "unicode/1f6c0.png?v8",
            bathtub: "unicode/1f6c1.png?v8",
            battery: "unicode/1f50b.png?v8",
            beach_umbrella: "unicode/1f3d6.png?v8",
            bear: "unicode/1f43b.png?v8",
            bearded_person: "unicode/1f9d4.png?v8",
            beaver: "unicode/1f9ab.png?v8",
            bed: "unicode/1f6cf.png?v8",
            bee: "unicode/1f41d.png?v8",
            beer: "unicode/1f37a.png?v8",
            beers: "unicode/1f37b.png?v8",
            beetle: "unicode/1fab2.png?v8",
            beginner: "unicode/1f530.png?v8",
            belarus: "unicode/1f1e7-1f1fe.png?v8",
            belgium: "unicode/1f1e7-1f1ea.png?v8",
            belize: "unicode/1f1e7-1f1ff.png?v8",
            bell: "unicode/1f514.png?v8",
            bell_pepper: "unicode/1fad1.png?v8",
            bellhop_bell: "unicode/1f6ce.png?v8",
            benin: "unicode/1f1e7-1f1ef.png?v8",
            bento: "unicode/1f371.png?v8",
            bermuda: "unicode/1f1e7-1f1f2.png?v8",
            beverage_box: "unicode/1f9c3.png?v8",
            bhutan: "unicode/1f1e7-1f1f9.png?v8",
            bicyclist: "unicode/1f6b4.png?v8",
            bike: "unicode/1f6b2.png?v8",
            biking_man: "unicode/1f6b4-2642.png?v8",
            biking_woman: "unicode/1f6b4-2640.png?v8",
            bikini: "unicode/1f459.png?v8",
            billed_cap: "unicode/1f9e2.png?v8",
            biohazard: "unicode/2623.png?v8",
            bird: "unicode/1f426.png?v8",
            birthday: "unicode/1f382.png?v8",
            bison: "unicode/1f9ac.png?v8",
            black_cat: "unicode/1f408-2b1b.png?v8",
            black_circle: "unicode/26ab.png?v8",
            black_flag: "unicode/1f3f4.png?v8",
            black_heart: "unicode/1f5a4.png?v8",
            black_joker: "unicode/1f0cf.png?v8",
            black_large_square: "unicode/2b1b.png?v8",
            black_medium_small_square: "unicode/25fe.png?v8",
            black_medium_square: "unicode/25fc.png?v8",
            black_nib: "unicode/2712.png?v8",
            black_small_square: "unicode/25aa.png?v8",
            black_square_button: "unicode/1f532.png?v8",
            blond_haired_man: "unicode/1f471-2642.png?v8",
            blond_haired_person: "unicode/1f471.png?v8",
            blond_haired_woman: "unicode/1f471-2640.png?v8",
            blonde_woman: "unicode/1f471-2640.png?v8",
            blossom: "unicode/1f33c.png?v8",
            blowfish: "unicode/1f421.png?v8",
            blue_book: "unicode/1f4d8.png?v8",
            blue_car: "unicode/1f699.png?v8",
            blue_heart: "unicode/1f499.png?v8",
            blue_square: "unicode/1f7e6.png?v8",
            blueberries: "unicode/1fad0.png?v8",
            blush: "unicode/1f60a.png?v8",
            boar: "unicode/1f417.png?v8",
            boat: "unicode/26f5.png?v8",
            bolivia: "unicode/1f1e7-1f1f4.png?v8",
            bomb: "unicode/1f4a3.png?v8",
            bone: "unicode/1f9b4.png?v8",
            book: "unicode/1f4d6.png?v8",
            bookmark: "unicode/1f516.png?v8",
            bookmark_tabs: "unicode/1f4d1.png?v8",
            books: "unicode/1f4da.png?v8",
            boom: "unicode/1f4a5.png?v8",
            boomerang: "unicode/1fa83.png?v8",
            boot: "unicode/1f462.png?v8",
            bosnia_herzegovina: "unicode/1f1e7-1f1e6.png?v8",
            botswana: "unicode/1f1e7-1f1fc.png?v8",
            bouncing_ball_man: "unicode/26f9-2642.png?v8",
            bouncing_ball_person: "unicode/26f9.png?v8",
            bouncing_ball_woman: "unicode/26f9-2640.png?v8",
            bouquet: "unicode/1f490.png?v8",
            bouvet_island: "unicode/1f1e7-1f1fb.png?v8",
            bow: "unicode/1f647.png?v8",
            bow_and_arrow: "unicode/1f3f9.png?v8",
            bowing_man: "unicode/1f647-2642.png?v8",
            bowing_woman: "unicode/1f647-2640.png?v8",
            bowl_with_spoon: "unicode/1f963.png?v8",
            bowling: "unicode/1f3b3.png?v8",
            bowtie: "bowtie.png?v8",
            boxing_glove: "unicode/1f94a.png?v8",
            boy: "unicode/1f466.png?v8",
            brain: "unicode/1f9e0.png?v8",
            brazil: "unicode/1f1e7-1f1f7.png?v8",
            bread: "unicode/1f35e.png?v8",
            breast_feeding: "unicode/1f931.png?v8",
            bricks: "unicode/1f9f1.png?v8",
            bride_with_veil: "unicode/1f470-2640.png?v8",
            bridge_at_night: "unicode/1f309.png?v8",
            briefcase: "unicode/1f4bc.png?v8",
            british_indian_ocean_territory: "unicode/1f1ee-1f1f4.png?v8",
            british_virgin_islands: "unicode/1f1fb-1f1ec.png?v8",
            broccoli: "unicode/1f966.png?v8",
            broken_heart: "unicode/1f494.png?v8",
            broom: "unicode/1f9f9.png?v8",
            brown_circle: "unicode/1f7e4.png?v8",
            brown_heart: "unicode/1f90e.png?v8",
            brown_square: "unicode/1f7eb.png?v8",
            brunei: "unicode/1f1e7-1f1f3.png?v8",
            bubble_tea: "unicode/1f9cb.png?v8",
            bucket: "unicode/1faa3.png?v8",
            bug: "unicode/1f41b.png?v8",
            building_construction: "unicode/1f3d7.png?v8",
            bulb: "unicode/1f4a1.png?v8",
            bulgaria: "unicode/1f1e7-1f1ec.png?v8",
            bullettrain_front: "unicode/1f685.png?v8",
            bullettrain_side: "unicode/1f684.png?v8",
            burkina_faso: "unicode/1f1e7-1f1eb.png?v8",
            burrito: "unicode/1f32f.png?v8",
            burundi: "unicode/1f1e7-1f1ee.png?v8",
            bus: "unicode/1f68c.png?v8",
            business_suit_levitating: "unicode/1f574.png?v8",
            busstop: "unicode/1f68f.png?v8",
            bust_in_silhouette: "unicode/1f464.png?v8",
            busts_in_silhouette: "unicode/1f465.png?v8",
            butter: "unicode/1f9c8.png?v8",
            butterfly: "unicode/1f98b.png?v8",
            cactus: "unicode/1f335.png?v8",
            cake: "unicode/1f370.png?v8",
            calendar: "unicode/1f4c6.png?v8",
            call_me_hand: "unicode/1f919.png?v8",
            calling: "unicode/1f4f2.png?v8",
            cambodia: "unicode/1f1f0-1f1ed.png?v8",
            camel: "unicode/1f42b.png?v8",
            camera: "unicode/1f4f7.png?v8",
            camera_flash: "unicode/1f4f8.png?v8",
            cameroon: "unicode/1f1e8-1f1f2.png?v8",
            camping: "unicode/1f3d5.png?v8",
            canada: "unicode/1f1e8-1f1e6.png?v8",
            canary_islands: "unicode/1f1ee-1f1e8.png?v8",
            cancer: "unicode/264b.png?v8",
            candle: "unicode/1f56f.png?v8",
            candy: "unicode/1f36c.png?v8",
            canned_food: "unicode/1f96b.png?v8",
            canoe: "unicode/1f6f6.png?v8",
            cape_verde: "unicode/1f1e8-1f1fb.png?v8",
            capital_abcd: "unicode/1f520.png?v8",
            capricorn: "unicode/2651.png?v8",
            car: "unicode/1f697.png?v8",
            card_file_box: "unicode/1f5c3.png?v8",
            card_index: "unicode/1f4c7.png?v8",
            card_index_dividers: "unicode/1f5c2.png?v8",
            caribbean_netherlands: "unicode/1f1e7-1f1f6.png?v8",
            carousel_horse: "unicode/1f3a0.png?v8",
            carpentry_saw: "unicode/1fa9a.png?v8",
            carrot: "unicode/1f955.png?v8",
            cartwheeling: "unicode/1f938.png?v8",
            cat: "unicode/1f431.png?v8",
            cat2: "unicode/1f408.png?v8",
            cayman_islands: "unicode/1f1f0-1f1fe.png?v8",
            cd: "unicode/1f4bf.png?v8",
            central_african_republic: "unicode/1f1e8-1f1eb.png?v8",
            ceuta_melilla: "unicode/1f1ea-1f1e6.png?v8",
            chad: "unicode/1f1f9-1f1e9.png?v8",
            chains: "unicode/26d3.png?v8",
            chair: "unicode/1fa91.png?v8",
            champagne: "unicode/1f37e.png?v8",
            chart: "unicode/1f4b9.png?v8",
            chart_with_downwards_trend: "unicode/1f4c9.png?v8",
            chart_with_upwards_trend: "unicode/1f4c8.png?v8",
            checkered_flag: "unicode/1f3c1.png?v8",
            cheese: "unicode/1f9c0.png?v8",
            cherries: "unicode/1f352.png?v8",
            cherry_blossom: "unicode/1f338.png?v8",
            chess_pawn: "unicode/265f.png?v8",
            chestnut: "unicode/1f330.png?v8",
            chicken: "unicode/1f414.png?v8",
            child: "unicode/1f9d2.png?v8",
            children_crossing: "unicode/1f6b8.png?v8",
            chile: "unicode/1f1e8-1f1f1.png?v8",
            chipmunk: "unicode/1f43f.png?v8",
            chocolate_bar: "unicode/1f36b.png?v8",
            chopsticks: "unicode/1f962.png?v8",
            christmas_island: "unicode/1f1e8-1f1fd.png?v8",
            christmas_tree: "unicode/1f384.png?v8",
            church: "unicode/26ea.png?v8",
            cinema: "unicode/1f3a6.png?v8",
            circus_tent: "unicode/1f3aa.png?v8",
            city_sunrise: "unicode/1f307.png?v8",
            city_sunset: "unicode/1f306.png?v8",
            cityscape: "unicode/1f3d9.png?v8",
            cl: "unicode/1f191.png?v8",
            clamp: "unicode/1f5dc.png?v8",
            clap: "unicode/1f44f.png?v8",
            clapper: "unicode/1f3ac.png?v8",
            classical_building: "unicode/1f3db.png?v8",
            climbing: "unicode/1f9d7.png?v8",
            climbing_man: "unicode/1f9d7-2642.png?v8",
            climbing_woman: "unicode/1f9d7-2640.png?v8",
            clinking_glasses: "unicode/1f942.png?v8",
            clipboard: "unicode/1f4cb.png?v8",
            clipperton_island: "unicode/1f1e8-1f1f5.png?v8",
            clock1: "unicode/1f550.png?v8",
            clock10: "unicode/1f559.png?v8",
            clock1030: "unicode/1f565.png?v8",
            clock11: "unicode/1f55a.png?v8",
            clock1130: "unicode/1f566.png?v8",
            clock12: "unicode/1f55b.png?v8",
            clock1230: "unicode/1f567.png?v8",
            clock130: "unicode/1f55c.png?v8",
            clock2: "unicode/1f551.png?v8",
            clock230: "unicode/1f55d.png?v8",
            clock3: "unicode/1f552.png?v8",
            clock330: "unicode/1f55e.png?v8",
            clock4: "unicode/1f553.png?v8",
            clock430: "unicode/1f55f.png?v8",
            clock5: "unicode/1f554.png?v8",
            clock530: "unicode/1f560.png?v8",
            clock6: "unicode/1f555.png?v8",
            clock630: "unicode/1f561.png?v8",
            clock7: "unicode/1f556.png?v8",
            clock730: "unicode/1f562.png?v8",
            clock8: "unicode/1f557.png?v8",
            clock830: "unicode/1f563.png?v8",
            clock9: "unicode/1f558.png?v8",
            clock930: "unicode/1f564.png?v8",
            closed_book: "unicode/1f4d5.png?v8",
            closed_lock_with_key: "unicode/1f510.png?v8",
            closed_umbrella: "unicode/1f302.png?v8",
            cloud: "unicode/2601.png?v8",
            cloud_with_lightning: "unicode/1f329.png?v8",
            cloud_with_lightning_and_rain: "unicode/26c8.png?v8",
            cloud_with_rain: "unicode/1f327.png?v8",
            cloud_with_snow: "unicode/1f328.png?v8",
            clown_face: "unicode/1f921.png?v8",
            clubs: "unicode/2663.png?v8",
            cn: "unicode/1f1e8-1f1f3.png?v8",
            coat: "unicode/1f9e5.png?v8",
            cockroach: "unicode/1fab3.png?v8",
            cocktail: "unicode/1f378.png?v8",
            coconut: "unicode/1f965.png?v8",
            cocos_islands: "unicode/1f1e8-1f1e8.png?v8",
            coffee: "unicode/2615.png?v8",
            coffin: "unicode/26b0.png?v8",
            coin: "unicode/1fa99.png?v8",
            cold_face: "unicode/1f976.png?v8",
            cold_sweat: "unicode/1f630.png?v8",
            collision: "unicode/1f4a5.png?v8",
            colombia: "unicode/1f1e8-1f1f4.png?v8",
            comet: "unicode/2604.png?v8",
            comoros: "unicode/1f1f0-1f1f2.png?v8",
            compass: "unicode/1f9ed.png?v8",
            computer: "unicode/1f4bb.png?v8",
            computer_mouse: "unicode/1f5b1.png?v8",
            confetti_ball: "unicode/1f38a.png?v8",
            confounded: "unicode/1f616.png?v8",
            confused: "unicode/1f615.png?v8",
            congo_brazzaville: "unicode/1f1e8-1f1ec.png?v8",
            congo_kinshasa: "unicode/1f1e8-1f1e9.png?v8",
            congratulations: "unicode/3297.png?v8",
            construction: "unicode/1f6a7.png?v8",
            construction_worker: "unicode/1f477.png?v8",
            construction_worker_man: "unicode/1f477-2642.png?v8",
            construction_worker_woman: "unicode/1f477-2640.png?v8",
            control_knobs: "unicode/1f39b.png?v8",
            convenience_store: "unicode/1f3ea.png?v8",
            cook: "unicode/1f9d1-1f373.png?v8",
            cook_islands: "unicode/1f1e8-1f1f0.png?v8",
            cookie: "unicode/1f36a.png?v8",
            cool: "unicode/1f192.png?v8",
            cop: "unicode/1f46e.png?v8",
            copyright: "unicode/00a9.png?v8",
            corn: "unicode/1f33d.png?v8",
            costa_rica: "unicode/1f1e8-1f1f7.png?v8",
            cote_divoire: "unicode/1f1e8-1f1ee.png?v8",
            couch_and_lamp: "unicode/1f6cb.png?v8",
            couple: "unicode/1f46b.png?v8",
            couple_with_heart: "unicode/1f491.png?v8",
            couple_with_heart_man_man: "unicode/1f468-2764-1f468.png?v8",
            couple_with_heart_woman_man: "unicode/1f469-2764-1f468.png?v8",
            couple_with_heart_woman_woman: "unicode/1f469-2764-1f469.png?v8",
            couplekiss: "unicode/1f48f.png?v8",
            couplekiss_man_man: "unicode/1f468-2764-1f48b-1f468.png?v8",
            couplekiss_man_woman: "unicode/1f469-2764-1f48b-1f468.png?v8",
            couplekiss_woman_woman: "unicode/1f469-2764-1f48b-1f469.png?v8",
            cow: "unicode/1f42e.png?v8",
            cow2: "unicode/1f404.png?v8",
            cowboy_hat_face: "unicode/1f920.png?v8",
            crab: "unicode/1f980.png?v8",
            crayon: "unicode/1f58d.png?v8",
            credit_card: "unicode/1f4b3.png?v8",
            crescent_moon: "unicode/1f319.png?v8",
            cricket: "unicode/1f997.png?v8",
            cricket_game: "unicode/1f3cf.png?v8",
            croatia: "unicode/1f1ed-1f1f7.png?v8",
            crocodile: "unicode/1f40a.png?v8",
            croissant: "unicode/1f950.png?v8",
            crossed_fingers: "unicode/1f91e.png?v8",
            crossed_flags: "unicode/1f38c.png?v8",
            crossed_swords: "unicode/2694.png?v8",
            crown: "unicode/1f451.png?v8",
            cry: "unicode/1f622.png?v8",
            crying_cat_face: "unicode/1f63f.png?v8",
            crystal_ball: "unicode/1f52e.png?v8",
            cuba: "unicode/1f1e8-1f1fa.png?v8",
            cucumber: "unicode/1f952.png?v8",
            cup_with_straw: "unicode/1f964.png?v8",
            cupcake: "unicode/1f9c1.png?v8",
            cupid: "unicode/1f498.png?v8",
            curacao: "unicode/1f1e8-1f1fc.png?v8",
            curling_stone: "unicode/1f94c.png?v8",
            curly_haired_man: "unicode/1f468-1f9b1.png?v8",
            curly_haired_woman: "unicode/1f469-1f9b1.png?v8",
            curly_loop: "unicode/27b0.png?v8",
            currency_exchange: "unicode/1f4b1.png?v8",
            curry: "unicode/1f35b.png?v8",
            cursing_face: "unicode/1f92c.png?v8",
            custard: "unicode/1f36e.png?v8",
            customs: "unicode/1f6c3.png?v8",
            cut_of_meat: "unicode/1f969.png?v8",
            cyclone: "unicode/1f300.png?v8",
            cyprus: "unicode/1f1e8-1f1fe.png?v8",
            czech_republic: "unicode/1f1e8-1f1ff.png?v8",
            dagger: "unicode/1f5e1.png?v8",
            dancer: "unicode/1f483.png?v8",
            dancers: "unicode/1f46f.png?v8",
            dancing_men: "unicode/1f46f-2642.png?v8",
            dancing_women: "unicode/1f46f-2640.png?v8",
            dango: "unicode/1f361.png?v8",
            dark_sunglasses: "unicode/1f576.png?v8",
            dart: "unicode/1f3af.png?v8",
            dash: "unicode/1f4a8.png?v8",
            date: "unicode/1f4c5.png?v8",
            de: "unicode/1f1e9-1f1ea.png?v8",
            deaf_man: "unicode/1f9cf-2642.png?v8",
            deaf_person: "unicode/1f9cf.png?v8",
            deaf_woman: "unicode/1f9cf-2640.png?v8",
            deciduous_tree: "unicode/1f333.png?v8",
            deer: "unicode/1f98c.png?v8",
            denmark: "unicode/1f1e9-1f1f0.png?v8",
            department_store: "unicode/1f3ec.png?v8",
            dependabot: "dependabot.png?v8",
            derelict_house: "unicode/1f3da.png?v8",
            desert: "unicode/1f3dc.png?v8",
            desert_island: "unicode/1f3dd.png?v8",
            desktop_computer: "unicode/1f5a5.png?v8",
            detective: "unicode/1f575.png?v8",
            diamond_shape_with_a_dot_inside: "unicode/1f4a0.png?v8",
            diamonds: "unicode/2666.png?v8",
            diego_garcia: "unicode/1f1e9-1f1ec.png?v8",
            disappointed: "unicode/1f61e.png?v8",
            disappointed_relieved: "unicode/1f625.png?v8",
            disguised_face: "unicode/1f978.png?v8",
            diving_mask: "unicode/1f93f.png?v8",
            diya_lamp: "unicode/1fa94.png?v8",
            dizzy: "unicode/1f4ab.png?v8",
            dizzy_face: "unicode/1f635.png?v8",
            djibouti: "unicode/1f1e9-1f1ef.png?v8",
            dna: "unicode/1f9ec.png?v8",
            do_not_litter: "unicode/1f6af.png?v8",
            dodo: "unicode/1f9a4.png?v8",
            dog: "unicode/1f436.png?v8",
            dog2: "unicode/1f415.png?v8",
            dollar: "unicode/1f4b5.png?v8",
            dolls: "unicode/1f38e.png?v8",
            dolphin: "unicode/1f42c.png?v8",
            dominica: "unicode/1f1e9-1f1f2.png?v8",
            dominican_republic: "unicode/1f1e9-1f1f4.png?v8",
            door: "unicode/1f6aa.png?v8",
            doughnut: "unicode/1f369.png?v8",
            dove: "unicode/1f54a.png?v8",
            dragon: "unicode/1f409.png?v8",
            dragon_face: "unicode/1f432.png?v8",
            dress: "unicode/1f457.png?v8",
            dromedary_camel: "unicode/1f42a.png?v8",
            drooling_face: "unicode/1f924.png?v8",
            drop_of_blood: "unicode/1fa78.png?v8",
            droplet: "unicode/1f4a7.png?v8",
            drum: "unicode/1f941.png?v8",
            duck: "unicode/1f986.png?v8",
            dumpling: "unicode/1f95f.png?v8",
            dvd: "unicode/1f4c0.png?v8",
            "e-mail": "unicode/1f4e7.png?v8",
            eagle: "unicode/1f985.png?v8",
            ear: "unicode/1f442.png?v8",
            ear_of_rice: "unicode/1f33e.png?v8",
            ear_with_hearing_aid: "unicode/1f9bb.png?v8",
            earth_africa: "unicode/1f30d.png?v8",
            earth_americas: "unicode/1f30e.png?v8",
            earth_asia: "unicode/1f30f.png?v8",
            ecuador: "unicode/1f1ea-1f1e8.png?v8",
            egg: "unicode/1f95a.png?v8",
            eggplant: "unicode/1f346.png?v8",
            egypt: "unicode/1f1ea-1f1ec.png?v8",
            eight: "unicode/0038-20e3.png?v8",
            eight_pointed_black_star: "unicode/2734.png?v8",
            eight_spoked_asterisk: "unicode/2733.png?v8",
            eject_button: "unicode/23cf.png?v8",
            el_salvador: "unicode/1f1f8-1f1fb.png?v8",
            electric_plug: "unicode/1f50c.png?v8",
            electron: "electron.png?v8",
            elephant: "unicode/1f418.png?v8",
            elevator: "unicode/1f6d7.png?v8",
            elf: "unicode/1f9dd.png?v8",
            elf_man: "unicode/1f9dd-2642.png?v8",
            elf_woman: "unicode/1f9dd-2640.png?v8",
            email: "unicode/1f4e7.png?v8",
            end: "unicode/1f51a.png?v8",
            england: "unicode/1f3f4-e0067-e0062-e0065-e006e-e0067-e007f.png?v8",
            envelope: "unicode/2709.png?v8",
            envelope_with_arrow: "unicode/1f4e9.png?v8",
            equatorial_guinea: "unicode/1f1ec-1f1f6.png?v8",
            eritrea: "unicode/1f1ea-1f1f7.png?v8",
            es: "unicode/1f1ea-1f1f8.png?v8",
            estonia: "unicode/1f1ea-1f1ea.png?v8",
            ethiopia: "unicode/1f1ea-1f1f9.png?v8",
            eu: "unicode/1f1ea-1f1fa.png?v8",
            euro: "unicode/1f4b6.png?v8",
            european_castle: "unicode/1f3f0.png?v8",
            european_post_office: "unicode/1f3e4.png?v8",
            european_union: "unicode/1f1ea-1f1fa.png?v8",
            evergreen_tree: "unicode/1f332.png?v8",
            exclamation: "unicode/2757.png?v8",
            exploding_head: "unicode/1f92f.png?v8",
            expressionless: "unicode/1f611.png?v8",
            eye: "unicode/1f441.png?v8",
            eye_speech_bubble: "unicode/1f441-1f5e8.png?v8",
            eyeglasses: "unicode/1f453.png?v8",
            eyes: "unicode/1f440.png?v8",
            face_exhaling: "unicode/1f62e-1f4a8.png?v8",
            face_in_clouds: "unicode/1f636-1f32b.png?v8",
            face_with_head_bandage: "unicode/1f915.png?v8",
            face_with_spiral_eyes: "unicode/1f635-1f4ab.png?v8",
            face_with_thermometer: "unicode/1f912.png?v8",
            facepalm: "unicode/1f926.png?v8",
            facepunch: "unicode/1f44a.png?v8",
            factory: "unicode/1f3ed.png?v8",
            factory_worker: "unicode/1f9d1-1f3ed.png?v8",
            fairy: "unicode/1f9da.png?v8",
            fairy_man: "unicode/1f9da-2642.png?v8",
            fairy_woman: "unicode/1f9da-2640.png?v8",
            falafel: "unicode/1f9c6.png?v8",
            falkland_islands: "unicode/1f1eb-1f1f0.png?v8",
            fallen_leaf: "unicode/1f342.png?v8",
            family: "unicode/1f46a.png?v8",
            family_man_boy: "unicode/1f468-1f466.png?v8",
            family_man_boy_boy: "unicode/1f468-1f466-1f466.png?v8",
            family_man_girl: "unicode/1f468-1f467.png?v8",
            family_man_girl_boy: "unicode/1f468-1f467-1f466.png?v8",
            family_man_girl_girl: "unicode/1f468-1f467-1f467.png?v8",
            family_man_man_boy: "unicode/1f468-1f468-1f466.png?v8",
            family_man_man_boy_boy: "unicode/1f468-1f468-1f466-1f466.png?v8",
            family_man_man_girl: "unicode/1f468-1f468-1f467.png?v8",
            family_man_man_girl_boy: "unicode/1f468-1f468-1f467-1f466.png?v8",
            family_man_man_girl_girl: "unicode/1f468-1f468-1f467-1f467.png?v8",
            family_man_woman_boy: "unicode/1f468-1f469-1f466.png?v8",
            family_man_woman_boy_boy: "unicode/1f468-1f469-1f466-1f466.png?v8",
            family_man_woman_girl: "unicode/1f468-1f469-1f467.png?v8",
            family_man_woman_girl_boy: "unicode/1f468-1f469-1f467-1f466.png?v8",
            family_man_woman_girl_girl: "unicode/1f468-1f469-1f467-1f467.png?v8",
            family_woman_boy: "unicode/1f469-1f466.png?v8",
            family_woman_boy_boy: "unicode/1f469-1f466-1f466.png?v8",
            family_woman_girl: "unicode/1f469-1f467.png?v8",
            family_woman_girl_boy: "unicode/1f469-1f467-1f466.png?v8",
            family_woman_girl_girl: "unicode/1f469-1f467-1f467.png?v8",
            family_woman_woman_boy: "unicode/1f469-1f469-1f466.png?v8",
            family_woman_woman_boy_boy: "unicode/1f469-1f469-1f466-1f466.png?v8",
            family_woman_woman_girl: "unicode/1f469-1f469-1f467.png?v8",
            family_woman_woman_girl_boy: "unicode/1f469-1f469-1f467-1f466.png?v8",
            family_woman_woman_girl_girl: "unicode/1f469-1f469-1f467-1f467.png?v8",
            farmer: "unicode/1f9d1-1f33e.png?v8",
            faroe_islands: "unicode/1f1eb-1f1f4.png?v8",
            fast_forward: "unicode/23e9.png?v8",
            fax: "unicode/1f4e0.png?v8",
            fearful: "unicode/1f628.png?v8",
            feather: "unicode/1fab6.png?v8",
            feelsgood: "feelsgood.png?v8",
            feet: "unicode/1f43e.png?v8",
            female_detective: "unicode/1f575-2640.png?v8",
            female_sign: "unicode/2640.png?v8",
            ferris_wheel: "unicode/1f3a1.png?v8",
            ferry: "unicode/26f4.png?v8",
            field_hockey: "unicode/1f3d1.png?v8",
            fiji: "unicode/1f1eb-1f1ef.png?v8",
            file_cabinet: "unicode/1f5c4.png?v8",
            file_folder: "unicode/1f4c1.png?v8",
            film_projector: "unicode/1f4fd.png?v8",
            film_strip: "unicode/1f39e.png?v8",
            finland: "unicode/1f1eb-1f1ee.png?v8",
            finnadie: "finnadie.png?v8",
            fire: "unicode/1f525.png?v8",
            fire_engine: "unicode/1f692.png?v8",
            fire_extinguisher: "unicode/1f9ef.png?v8",
            firecracker: "unicode/1f9e8.png?v8",
            firefighter: "unicode/1f9d1-1f692.png?v8",
            fireworks: "unicode/1f386.png?v8",
            first_quarter_moon: "unicode/1f313.png?v8",
            first_quarter_moon_with_face: "unicode/1f31b.png?v8",
            fish: "unicode/1f41f.png?v8",
            fish_cake: "unicode/1f365.png?v8",
            fishing_pole_and_fish: "unicode/1f3a3.png?v8",
            fishsticks: "fishsticks.png?v8",
            fist: "unicode/270a.png?v8",
            fist_left: "unicode/1f91b.png?v8",
            fist_oncoming: "unicode/1f44a.png?v8",
            fist_raised: "unicode/270a.png?v8",
            fist_right: "unicode/1f91c.png?v8",
            five: "unicode/0035-20e3.png?v8",
            flags: "unicode/1f38f.png?v8",
            flamingo: "unicode/1f9a9.png?v8",
            flashlight: "unicode/1f526.png?v8",
            flat_shoe: "unicode/1f97f.png?v8",
            flatbread: "unicode/1fad3.png?v8",
            fleur_de_lis: "unicode/269c.png?v8",
            flight_arrival: "unicode/1f6ec.png?v8",
            flight_departure: "unicode/1f6eb.png?v8",
            flipper: "unicode/1f42c.png?v8",
            floppy_disk: "unicode/1f4be.png?v8",
            flower_playing_cards: "unicode/1f3b4.png?v8",
            flushed: "unicode/1f633.png?v8",
            fly: "unicode/1fab0.png?v8",
            flying_disc: "unicode/1f94f.png?v8",
            flying_saucer: "unicode/1f6f8.png?v8",
            fog: "unicode/1f32b.png?v8",
            foggy: "unicode/1f301.png?v8",
            fondue: "unicode/1fad5.png?v8",
            foot: "unicode/1f9b6.png?v8",
            football: "unicode/1f3c8.png?v8",
            footprints: "unicode/1f463.png?v8",
            fork_and_knife: "unicode/1f374.png?v8",
            fortune_cookie: "unicode/1f960.png?v8",
            fountain: "unicode/26f2.png?v8",
            fountain_pen: "unicode/1f58b.png?v8",
            four: "unicode/0034-20e3.png?v8",
            four_leaf_clover: "unicode/1f340.png?v8",
            fox_face: "unicode/1f98a.png?v8",
            fr: "unicode/1f1eb-1f1f7.png?v8",
            framed_picture: "unicode/1f5bc.png?v8",
            free: "unicode/1f193.png?v8",
            french_guiana: "unicode/1f1ec-1f1eb.png?v8",
            french_polynesia: "unicode/1f1f5-1f1eb.png?v8",
            french_southern_territories: "unicode/1f1f9-1f1eb.png?v8",
            fried_egg: "unicode/1f373.png?v8",
            fried_shrimp: "unicode/1f364.png?v8",
            fries: "unicode/1f35f.png?v8",
            frog: "unicode/1f438.png?v8",
            frowning: "unicode/1f626.png?v8",
            frowning_face: "unicode/2639.png?v8",
            frowning_man: "unicode/1f64d-2642.png?v8",
            frowning_person: "unicode/1f64d.png?v8",
            frowning_woman: "unicode/1f64d-2640.png?v8",
            fu: "unicode/1f595.png?v8",
            fuelpump: "unicode/26fd.png?v8",
            full_moon: "unicode/1f315.png?v8",
            full_moon_with_face: "unicode/1f31d.png?v8",
            funeral_urn: "unicode/26b1.png?v8",
            gabon: "unicode/1f1ec-1f1e6.png?v8",
            gambia: "unicode/1f1ec-1f1f2.png?v8",
            game_die: "unicode/1f3b2.png?v8",
            garlic: "unicode/1f9c4.png?v8",
            gb: "unicode/1f1ec-1f1e7.png?v8",
            gear: "unicode/2699.png?v8",
            gem: "unicode/1f48e.png?v8",
            gemini: "unicode/264a.png?v8",
            genie: "unicode/1f9de.png?v8",
            genie_man: "unicode/1f9de-2642.png?v8",
            genie_woman: "unicode/1f9de-2640.png?v8",
            georgia: "unicode/1f1ec-1f1ea.png?v8",
            ghana: "unicode/1f1ec-1f1ed.png?v8",
            ghost: "unicode/1f47b.png?v8",
            gibraltar: "unicode/1f1ec-1f1ee.png?v8",
            gift: "unicode/1f381.png?v8",
            gift_heart: "unicode/1f49d.png?v8",
            giraffe: "unicode/1f992.png?v8",
            girl: "unicode/1f467.png?v8",
            globe_with_meridians: "unicode/1f310.png?v8",
            gloves: "unicode/1f9e4.png?v8",
            goal_net: "unicode/1f945.png?v8",
            goat: "unicode/1f410.png?v8",
            goberserk: "goberserk.png?v8",
            godmode: "godmode.png?v8",
            goggles: "unicode/1f97d.png?v8",
            golf: "unicode/26f3.png?v8",
            golfing: "unicode/1f3cc.png?v8",
            golfing_man: "unicode/1f3cc-2642.png?v8",
            golfing_woman: "unicode/1f3cc-2640.png?v8",
            gorilla: "unicode/1f98d.png?v8",
            grapes: "unicode/1f347.png?v8",
            greece: "unicode/1f1ec-1f1f7.png?v8",
            green_apple: "unicode/1f34f.png?v8",
            green_book: "unicode/1f4d7.png?v8",
            green_circle: "unicode/1f7e2.png?v8",
            green_heart: "unicode/1f49a.png?v8",
            green_salad: "unicode/1f957.png?v8",
            green_square: "unicode/1f7e9.png?v8",
            greenland: "unicode/1f1ec-1f1f1.png?v8",
            grenada: "unicode/1f1ec-1f1e9.png?v8",
            grey_exclamation: "unicode/2755.png?v8",
            grey_question: "unicode/2754.png?v8",
            grimacing: "unicode/1f62c.png?v8",
            grin: "unicode/1f601.png?v8",
            grinning: "unicode/1f600.png?v8",
            guadeloupe: "unicode/1f1ec-1f1f5.png?v8",
            guam: "unicode/1f1ec-1f1fa.png?v8",
            guard: "unicode/1f482.png?v8",
            guardsman: "unicode/1f482-2642.png?v8",
            guardswoman: "unicode/1f482-2640.png?v8",
            guatemala: "unicode/1f1ec-1f1f9.png?v8",
            guernsey: "unicode/1f1ec-1f1ec.png?v8",
            guide_dog: "unicode/1f9ae.png?v8",
            guinea: "unicode/1f1ec-1f1f3.png?v8",
            guinea_bissau: "unicode/1f1ec-1f1fc.png?v8",
            guitar: "unicode/1f3b8.png?v8",
            gun: "unicode/1f52b.png?v8",
            guyana: "unicode/1f1ec-1f1fe.png?v8",
            haircut: "unicode/1f487.png?v8",
            haircut_man: "unicode/1f487-2642.png?v8",
            haircut_woman: "unicode/1f487-2640.png?v8",
            haiti: "unicode/1f1ed-1f1f9.png?v8",
            hamburger: "unicode/1f354.png?v8",
            hammer: "unicode/1f528.png?v8",
            hammer_and_pick: "unicode/2692.png?v8",
            hammer_and_wrench: "unicode/1f6e0.png?v8",
            hamster: "unicode/1f439.png?v8",
            hand: "unicode/270b.png?v8",
            hand_over_mouth: "unicode/1f92d.png?v8",
            handbag: "unicode/1f45c.png?v8",
            handball_person: "unicode/1f93e.png?v8",
            handshake: "unicode/1f91d.png?v8",
            hankey: "unicode/1f4a9.png?v8",
            hash: "unicode/0023-20e3.png?v8",
            hatched_chick: "unicode/1f425.png?v8",
            hatching_chick: "unicode/1f423.png?v8",
            headphones: "unicode/1f3a7.png?v8",
            headstone: "unicode/1faa6.png?v8",
            health_worker: "unicode/1f9d1-2695.png?v8",
            hear_no_evil: "unicode/1f649.png?v8",
            heard_mcdonald_islands: "unicode/1f1ed-1f1f2.png?v8",
            heart: "unicode/2764.png?v8",
            heart_decoration: "unicode/1f49f.png?v8",
            heart_eyes: "unicode/1f60d.png?v8",
            heart_eyes_cat: "unicode/1f63b.png?v8",
            heart_on_fire: "unicode/2764-1f525.png?v8",
            heartbeat: "unicode/1f493.png?v8",
            heartpulse: "unicode/1f497.png?v8",
            hearts: "unicode/2665.png?v8",
            heavy_check_mark: "unicode/2714.png?v8",
            heavy_division_sign: "unicode/2797.png?v8",
            heavy_dollar_sign: "unicode/1f4b2.png?v8",
            heavy_exclamation_mark: "unicode/2757.png?v8",
            heavy_heart_exclamation: "unicode/2763.png?v8",
            heavy_minus_sign: "unicode/2796.png?v8",
            heavy_multiplication_x: "unicode/2716.png?v8",
            heavy_plus_sign: "unicode/2795.png?v8",
            hedgehog: "unicode/1f994.png?v8",
            helicopter: "unicode/1f681.png?v8",
            herb: "unicode/1f33f.png?v8",
            hibiscus: "unicode/1f33a.png?v8",
            high_brightness: "unicode/1f506.png?v8",
            high_heel: "unicode/1f460.png?v8",
            hiking_boot: "unicode/1f97e.png?v8",
            hindu_temple: "unicode/1f6d5.png?v8",
            hippopotamus: "unicode/1f99b.png?v8",
            hocho: "unicode/1f52a.png?v8",
            hole: "unicode/1f573.png?v8",
            honduras: "unicode/1f1ed-1f1f3.png?v8",
            honey_pot: "unicode/1f36f.png?v8",
            honeybee: "unicode/1f41d.png?v8",
            hong_kong: "unicode/1f1ed-1f1f0.png?v8",
            hook: "unicode/1fa9d.png?v8",
            horse: "unicode/1f434.png?v8",
            horse_racing: "unicode/1f3c7.png?v8",
            hospital: "unicode/1f3e5.png?v8",
            hot_face: "unicode/1f975.png?v8",
            hot_pepper: "unicode/1f336.png?v8",
            hotdog: "unicode/1f32d.png?v8",
            hotel: "unicode/1f3e8.png?v8",
            hotsprings: "unicode/2668.png?v8",
            hourglass: "unicode/231b.png?v8",
            hourglass_flowing_sand: "unicode/23f3.png?v8",
            house: "unicode/1f3e0.png?v8",
            house_with_garden: "unicode/1f3e1.png?v8",
            houses: "unicode/1f3d8.png?v8",
            hugs: "unicode/1f917.png?v8",
            hungary: "unicode/1f1ed-1f1fa.png?v8",
            hurtrealbad: "hurtrealbad.png?v8",
            hushed: "unicode/1f62f.png?v8",
            hut: "unicode/1f6d6.png?v8",
            ice_cream: "unicode/1f368.png?v8",
            ice_cube: "unicode/1f9ca.png?v8",
            ice_hockey: "unicode/1f3d2.png?v8",
            ice_skate: "unicode/26f8.png?v8",
            icecream: "unicode/1f366.png?v8",
            iceland: "unicode/1f1ee-1f1f8.png?v8",
            id: "unicode/1f194.png?v8",
            ideograph_advantage: "unicode/1f250.png?v8",
            imp: "unicode/1f47f.png?v8",
            inbox_tray: "unicode/1f4e5.png?v8",
            incoming_envelope: "unicode/1f4e8.png?v8",
            india: "unicode/1f1ee-1f1f3.png?v8",
            indonesia: "unicode/1f1ee-1f1e9.png?v8",
            infinity: "unicode/267e.png?v8",
            information_desk_person: "unicode/1f481.png?v8",
            information_source: "unicode/2139.png?v8",
            innocent: "unicode/1f607.png?v8",
            interrobang: "unicode/2049.png?v8",
            iphone: "unicode/1f4f1.png?v8",
            iran: "unicode/1f1ee-1f1f7.png?v8",
            iraq: "unicode/1f1ee-1f1f6.png?v8",
            ireland: "unicode/1f1ee-1f1ea.png?v8",
            isle_of_man: "unicode/1f1ee-1f1f2.png?v8",
            israel: "unicode/1f1ee-1f1f1.png?v8",
            it: "unicode/1f1ee-1f1f9.png?v8",
            izakaya_lantern: "unicode/1f3ee.png?v8",
            jack_o_lantern: "unicode/1f383.png?v8",
            jamaica: "unicode/1f1ef-1f1f2.png?v8",
            japan: "unicode/1f5fe.png?v8",
            japanese_castle: "unicode/1f3ef.png?v8",
            japanese_goblin: "unicode/1f47a.png?v8",
            japanese_ogre: "unicode/1f479.png?v8",
            jeans: "unicode/1f456.png?v8",
            jersey: "unicode/1f1ef-1f1ea.png?v8",
            jigsaw: "unicode/1f9e9.png?v8",
            jordan: "unicode/1f1ef-1f1f4.png?v8",
            joy: "unicode/1f602.png?v8",
            joy_cat: "unicode/1f639.png?v8",
            joystick: "unicode/1f579.png?v8",
            jp: "unicode/1f1ef-1f1f5.png?v8",
            judge: "unicode/1f9d1-2696.png?v8",
            juggling_person: "unicode/1f939.png?v8",
            kaaba: "unicode/1f54b.png?v8",
            kangaroo: "unicode/1f998.png?v8",
            kazakhstan: "unicode/1f1f0-1f1ff.png?v8",
            kenya: "unicode/1f1f0-1f1ea.png?v8",
            key: "unicode/1f511.png?v8",
            keyboard: "unicode/2328.png?v8",
            keycap_ten: "unicode/1f51f.png?v8",
            kick_scooter: "unicode/1f6f4.png?v8",
            kimono: "unicode/1f458.png?v8",
            kiribati: "unicode/1f1f0-1f1ee.png?v8",
            kiss: "unicode/1f48b.png?v8",
            kissing: "unicode/1f617.png?v8",
            kissing_cat: "unicode/1f63d.png?v8",
            kissing_closed_eyes: "unicode/1f61a.png?v8",
            kissing_heart: "unicode/1f618.png?v8",
            kissing_smiling_eyes: "unicode/1f619.png?v8",
            kite: "unicode/1fa81.png?v8",
            kiwi_fruit: "unicode/1f95d.png?v8",
            kneeling_man: "unicode/1f9ce-2642.png?v8",
            kneeling_person: "unicode/1f9ce.png?v8",
            kneeling_woman: "unicode/1f9ce-2640.png?v8",
            knife: "unicode/1f52a.png?v8",
            knot: "unicode/1faa2.png?v8",
            koala: "unicode/1f428.png?v8",
            koko: "unicode/1f201.png?v8",
            kosovo: "unicode/1f1fd-1f1f0.png?v8",
            kr: "unicode/1f1f0-1f1f7.png?v8",
            kuwait: "unicode/1f1f0-1f1fc.png?v8",
            kyrgyzstan: "unicode/1f1f0-1f1ec.png?v8",
            lab_coat: "unicode/1f97c.png?v8",
            label: "unicode/1f3f7.png?v8",
            lacrosse: "unicode/1f94d.png?v8",
            ladder: "unicode/1fa9c.png?v8",
            lady_beetle: "unicode/1f41e.png?v8",
            lantern: "unicode/1f3ee.png?v8",
            laos: "unicode/1f1f1-1f1e6.png?v8",
            large_blue_circle: "unicode/1f535.png?v8",
            large_blue_diamond: "unicode/1f537.png?v8",
            large_orange_diamond: "unicode/1f536.png?v8",
            last_quarter_moon: "unicode/1f317.png?v8",
            last_quarter_moon_with_face: "unicode/1f31c.png?v8",
            latin_cross: "unicode/271d.png?v8",
            latvia: "unicode/1f1f1-1f1fb.png?v8",
            laughing: "unicode/1f606.png?v8",
            leafy_green: "unicode/1f96c.png?v8",
            leaves: "unicode/1f343.png?v8",
            lebanon: "unicode/1f1f1-1f1e7.png?v8",
            ledger: "unicode/1f4d2.png?v8",
            left_luggage: "unicode/1f6c5.png?v8",
            left_right_arrow: "unicode/2194.png?v8",
            left_speech_bubble: "unicode/1f5e8.png?v8",
            leftwards_arrow_with_hook: "unicode/21a9.png?v8",
            leg: "unicode/1f9b5.png?v8",
            lemon: "unicode/1f34b.png?v8",
            leo: "unicode/264c.png?v8",
            leopard: "unicode/1f406.png?v8",
            lesotho: "unicode/1f1f1-1f1f8.png?v8",
            level_slider: "unicode/1f39a.png?v8",
            liberia: "unicode/1f1f1-1f1f7.png?v8",
            libra: "unicode/264e.png?v8",
            libya: "unicode/1f1f1-1f1fe.png?v8",
            liechtenstein: "unicode/1f1f1-1f1ee.png?v8",
            light_rail: "unicode/1f688.png?v8",
            link: "unicode/1f517.png?v8",
            lion: "unicode/1f981.png?v8",
            lips: "unicode/1f444.png?v8",
            lipstick: "unicode/1f484.png?v8",
            lithuania: "unicode/1f1f1-1f1f9.png?v8",
            lizard: "unicode/1f98e.png?v8",
            llama: "unicode/1f999.png?v8",
            lobster: "unicode/1f99e.png?v8",
            lock: "unicode/1f512.png?v8",
            lock_with_ink_pen: "unicode/1f50f.png?v8",
            lollipop: "unicode/1f36d.png?v8",
            long_drum: "unicode/1fa98.png?v8",
            loop: "unicode/27bf.png?v8",
            lotion_bottle: "unicode/1f9f4.png?v8",
            lotus_position: "unicode/1f9d8.png?v8",
            lotus_position_man: "unicode/1f9d8-2642.png?v8",
            lotus_position_woman: "unicode/1f9d8-2640.png?v8",
            loud_sound: "unicode/1f50a.png?v8",
            loudspeaker: "unicode/1f4e2.png?v8",
            love_hotel: "unicode/1f3e9.png?v8",
            love_letter: "unicode/1f48c.png?v8",
            love_you_gesture: "unicode/1f91f.png?v8",
            low_brightness: "unicode/1f505.png?v8",
            luggage: "unicode/1f9f3.png?v8",
            lungs: "unicode/1fac1.png?v8",
            luxembourg: "unicode/1f1f1-1f1fa.png?v8",
            lying_face: "unicode/1f925.png?v8",
            m: "unicode/24c2.png?v8",
            macau: "unicode/1f1f2-1f1f4.png?v8",
            macedonia: "unicode/1f1f2-1f1f0.png?v8",
            madagascar: "unicode/1f1f2-1f1ec.png?v8",
            mag: "unicode/1f50d.png?v8",
            mag_right: "unicode/1f50e.png?v8",
            mage: "unicode/1f9d9.png?v8",
            mage_man: "unicode/1f9d9-2642.png?v8",
            mage_woman: "unicode/1f9d9-2640.png?v8",
            magic_wand: "unicode/1fa84.png?v8",
            magnet: "unicode/1f9f2.png?v8",
            mahjong: "unicode/1f004.png?v8",
            mailbox: "unicode/1f4eb.png?v8",
            mailbox_closed: "unicode/1f4ea.png?v8",
            mailbox_with_mail: "unicode/1f4ec.png?v8",
            mailbox_with_no_mail: "unicode/1f4ed.png?v8",
            malawi: "unicode/1f1f2-1f1fc.png?v8",
            malaysia: "unicode/1f1f2-1f1fe.png?v8",
            maldives: "unicode/1f1f2-1f1fb.png?v8",
            male_detective: "unicode/1f575-2642.png?v8",
            male_sign: "unicode/2642.png?v8",
            mali: "unicode/1f1f2-1f1f1.png?v8",
            malta: "unicode/1f1f2-1f1f9.png?v8",
            mammoth: "unicode/1f9a3.png?v8",
            man: "unicode/1f468.png?v8",
            man_artist: "unicode/1f468-1f3a8.png?v8",
            man_astronaut: "unicode/1f468-1f680.png?v8",
            man_beard: "unicode/1f9d4-2642.png?v8",
            man_cartwheeling: "unicode/1f938-2642.png?v8",
            man_cook: "unicode/1f468-1f373.png?v8",
            man_dancing: "unicode/1f57a.png?v8",
            man_facepalming: "unicode/1f926-2642.png?v8",
            man_factory_worker: "unicode/1f468-1f3ed.png?v8",
            man_farmer: "unicode/1f468-1f33e.png?v8",
            man_feeding_baby: "unicode/1f468-1f37c.png?v8",
            man_firefighter: "unicode/1f468-1f692.png?v8",
            man_health_worker: "unicode/1f468-2695.png?v8",
            man_in_manual_wheelchair: "unicode/1f468-1f9bd.png?v8",
            man_in_motorized_wheelchair: "unicode/1f468-1f9bc.png?v8",
            man_in_tuxedo: "unicode/1f935-2642.png?v8",
            man_judge: "unicode/1f468-2696.png?v8",
            man_juggling: "unicode/1f939-2642.png?v8",
            man_mechanic: "unicode/1f468-1f527.png?v8",
            man_office_worker: "unicode/1f468-1f4bc.png?v8",
            man_pilot: "unicode/1f468-2708.png?v8",
            man_playing_handball: "unicode/1f93e-2642.png?v8",
            man_playing_water_polo: "unicode/1f93d-2642.png?v8",
            man_scientist: "unicode/1f468-1f52c.png?v8",
            man_shrugging: "unicode/1f937-2642.png?v8",
            man_singer: "unicode/1f468-1f3a4.png?v8",
            man_student: "unicode/1f468-1f393.png?v8",
            man_teacher: "unicode/1f468-1f3eb.png?v8",
            man_technologist: "unicode/1f468-1f4bb.png?v8",
            man_with_gua_pi_mao: "unicode/1f472.png?v8",
            man_with_probing_cane: "unicode/1f468-1f9af.png?v8",
            man_with_turban: "unicode/1f473-2642.png?v8",
            man_with_veil: "unicode/1f470-2642.png?v8",
            mandarin: "unicode/1f34a.png?v8",
            mango: "unicode/1f96d.png?v8",
            mans_shoe: "unicode/1f45e.png?v8",
            mantelpiece_clock: "unicode/1f570.png?v8",
            manual_wheelchair: "unicode/1f9bd.png?v8",
            maple_leaf: "unicode/1f341.png?v8",
            marshall_islands: "unicode/1f1f2-1f1ed.png?v8",
            martial_arts_uniform: "unicode/1f94b.png?v8",
            martinique: "unicode/1f1f2-1f1f6.png?v8",
            mask: "unicode/1f637.png?v8",
            massage: "unicode/1f486.png?v8",
            massage_man: "unicode/1f486-2642.png?v8",
            massage_woman: "unicode/1f486-2640.png?v8",
            mate: "unicode/1f9c9.png?v8",
            mauritania: "unicode/1f1f2-1f1f7.png?v8",
            mauritius: "unicode/1f1f2-1f1fa.png?v8",
            mayotte: "unicode/1f1fe-1f1f9.png?v8",
            meat_on_bone: "unicode/1f356.png?v8",
            mechanic: "unicode/1f9d1-1f527.png?v8",
            mechanical_arm: "unicode/1f9be.png?v8",
            mechanical_leg: "unicode/1f9bf.png?v8",
            medal_military: "unicode/1f396.png?v8",
            medal_sports: "unicode/1f3c5.png?v8",
            medical_symbol: "unicode/2695.png?v8",
            mega: "unicode/1f4e3.png?v8",
            melon: "unicode/1f348.png?v8",
            memo: "unicode/1f4dd.png?v8",
            men_wrestling: "unicode/1f93c-2642.png?v8",
            mending_heart: "unicode/2764-1fa79.png?v8",
            menorah: "unicode/1f54e.png?v8",
            mens: "unicode/1f6b9.png?v8",
            mermaid: "unicode/1f9dc-2640.png?v8",
            merman: "unicode/1f9dc-2642.png?v8",
            merperson: "unicode/1f9dc.png?v8",
            metal: "unicode/1f918.png?v8",
            metro: "unicode/1f687.png?v8",
            mexico: "unicode/1f1f2-1f1fd.png?v8",
            microbe: "unicode/1f9a0.png?v8",
            micronesia: "unicode/1f1eb-1f1f2.png?v8",
            microphone: "unicode/1f3a4.png?v8",
            microscope: "unicode/1f52c.png?v8",
            middle_finger: "unicode/1f595.png?v8",
            military_helmet: "unicode/1fa96.png?v8",
            milk_glass: "unicode/1f95b.png?v8",
            milky_way: "unicode/1f30c.png?v8",
            minibus: "unicode/1f690.png?v8",
            minidisc: "unicode/1f4bd.png?v8",
            mirror: "unicode/1fa9e.png?v8",
            mobile_phone_off: "unicode/1f4f4.png?v8",
            moldova: "unicode/1f1f2-1f1e9.png?v8",
            monaco: "unicode/1f1f2-1f1e8.png?v8",
            money_mouth_face: "unicode/1f911.png?v8",
            money_with_wings: "unicode/1f4b8.png?v8",
            moneybag: "unicode/1f4b0.png?v8",
            mongolia: "unicode/1f1f2-1f1f3.png?v8",
            monkey: "unicode/1f412.png?v8",
            monkey_face: "unicode/1f435.png?v8",
            monocle_face: "unicode/1f9d0.png?v8",
            monorail: "unicode/1f69d.png?v8",
            montenegro: "unicode/1f1f2-1f1ea.png?v8",
            montserrat: "unicode/1f1f2-1f1f8.png?v8",
            moon: "unicode/1f314.png?v8",
            moon_cake: "unicode/1f96e.png?v8",
            morocco: "unicode/1f1f2-1f1e6.png?v8",
            mortar_board: "unicode/1f393.png?v8",
            mosque: "unicode/1f54c.png?v8",
            mosquito: "unicode/1f99f.png?v8",
            motor_boat: "unicode/1f6e5.png?v8",
            motor_scooter: "unicode/1f6f5.png?v8",
            motorcycle: "unicode/1f3cd.png?v8",
            motorized_wheelchair: "unicode/1f9bc.png?v8",
            motorway: "unicode/1f6e3.png?v8",
            mount_fuji: "unicode/1f5fb.png?v8",
            mountain: "unicode/26f0.png?v8",
            mountain_bicyclist: "unicode/1f6b5.png?v8",
            mountain_biking_man: "unicode/1f6b5-2642.png?v8",
            mountain_biking_woman: "unicode/1f6b5-2640.png?v8",
            mountain_cableway: "unicode/1f6a0.png?v8",
            mountain_railway: "unicode/1f69e.png?v8",
            mountain_snow: "unicode/1f3d4.png?v8",
            mouse: "unicode/1f42d.png?v8",
            mouse2: "unicode/1f401.png?v8",
            mouse_trap: "unicode/1faa4.png?v8",
            movie_camera: "unicode/1f3a5.png?v8",
            moyai: "unicode/1f5ff.png?v8",
            mozambique: "unicode/1f1f2-1f1ff.png?v8",
            mrs_claus: "unicode/1f936.png?v8",
            muscle: "unicode/1f4aa.png?v8",
            mushroom: "unicode/1f344.png?v8",
            musical_keyboard: "unicode/1f3b9.png?v8",
            musical_note: "unicode/1f3b5.png?v8",
            musical_score: "unicode/1f3bc.png?v8",
            mute: "unicode/1f507.png?v8",
            mx_claus: "unicode/1f9d1-1f384.png?v8",
            myanmar: "unicode/1f1f2-1f1f2.png?v8",
            nail_care: "unicode/1f485.png?v8",
            name_badge: "unicode/1f4db.png?v8",
            namibia: "unicode/1f1f3-1f1e6.png?v8",
            national_park: "unicode/1f3de.png?v8",
            nauru: "unicode/1f1f3-1f1f7.png?v8",
            nauseated_face: "unicode/1f922.png?v8",
            nazar_amulet: "unicode/1f9ff.png?v8",
            neckbeard: "neckbeard.png?v8",
            necktie: "unicode/1f454.png?v8",
            negative_squared_cross_mark: "unicode/274e.png?v8",
            nepal: "unicode/1f1f3-1f1f5.png?v8",
            nerd_face: "unicode/1f913.png?v8",
            nesting_dolls: "unicode/1fa86.png?v8",
            netherlands: "unicode/1f1f3-1f1f1.png?v8",
            neutral_face: "unicode/1f610.png?v8",
            new: "unicode/1f195.png?v8",
            new_caledonia: "unicode/1f1f3-1f1e8.png?v8",
            new_moon: "unicode/1f311.png?v8",
            new_moon_with_face: "unicode/1f31a.png?v8",
            new_zealand: "unicode/1f1f3-1f1ff.png?v8",
            newspaper: "unicode/1f4f0.png?v8",
            newspaper_roll: "unicode/1f5de.png?v8",
            next_track_button: "unicode/23ed.png?v8",
            ng: "unicode/1f196.png?v8",
            ng_man: "unicode/1f645-2642.png?v8",
            ng_woman: "unicode/1f645-2640.png?v8",
            nicaragua: "unicode/1f1f3-1f1ee.png?v8",
            niger: "unicode/1f1f3-1f1ea.png?v8",
            nigeria: "unicode/1f1f3-1f1ec.png?v8",
            night_with_stars: "unicode/1f303.png?v8",
            nine: "unicode/0039-20e3.png?v8",
            ninja: "unicode/1f977.png?v8",
            niue: "unicode/1f1f3-1f1fa.png?v8",
            no_bell: "unicode/1f515.png?v8",
            no_bicycles: "unicode/1f6b3.png?v8",
            no_entry: "unicode/26d4.png?v8",
            no_entry_sign: "unicode/1f6ab.png?v8",
            no_good: "unicode/1f645.png?v8",
            no_good_man: "unicode/1f645-2642.png?v8",
            no_good_woman: "unicode/1f645-2640.png?v8",
            no_mobile_phones: "unicode/1f4f5.png?v8",
            no_mouth: "unicode/1f636.png?v8",
            no_pedestrians: "unicode/1f6b7.png?v8",
            no_smoking: "unicode/1f6ad.png?v8",
            "non-potable_water": "unicode/1f6b1.png?v8",
            norfolk_island: "unicode/1f1f3-1f1eb.png?v8",
            north_korea: "unicode/1f1f0-1f1f5.png?v8",
            northern_mariana_islands: "unicode/1f1f2-1f1f5.png?v8",
            norway: "unicode/1f1f3-1f1f4.png?v8",
            nose: "unicode/1f443.png?v8",
            notebook: "unicode/1f4d3.png?v8",
            notebook_with_decorative_cover: "unicode/1f4d4.png?v8",
            notes: "unicode/1f3b6.png?v8",
            nut_and_bolt: "unicode/1f529.png?v8",
            o: "unicode/2b55.png?v8",
            o2: "unicode/1f17e.png?v8",
            ocean: "unicode/1f30a.png?v8",
            octocat: "octocat.png?v8",
            octopus: "unicode/1f419.png?v8",
            oden: "unicode/1f362.png?v8",
            office: "unicode/1f3e2.png?v8",
            office_worker: "unicode/1f9d1-1f4bc.png?v8",
            oil_drum: "unicode/1f6e2.png?v8",
            ok: "unicode/1f197.png?v8",
            ok_hand: "unicode/1f44c.png?v8",
            ok_man: "unicode/1f646-2642.png?v8",
            ok_person: "unicode/1f646.png?v8",
            ok_woman: "unicode/1f646-2640.png?v8",
            old_key: "unicode/1f5dd.png?v8",
            older_adult: "unicode/1f9d3.png?v8",
            older_man: "unicode/1f474.png?v8",
            older_woman: "unicode/1f475.png?v8",
            olive: "unicode/1fad2.png?v8",
            om: "unicode/1f549.png?v8",
            oman: "unicode/1f1f4-1f1f2.png?v8",
            on: "unicode/1f51b.png?v8",
            oncoming_automobile: "unicode/1f698.png?v8",
            oncoming_bus: "unicode/1f68d.png?v8",
            oncoming_police_car: "unicode/1f694.png?v8",
            oncoming_taxi: "unicode/1f696.png?v8",
            one: "unicode/0031-20e3.png?v8",
            one_piece_swimsuit: "unicode/1fa71.png?v8",
            onion: "unicode/1f9c5.png?v8",
            open_book: "unicode/1f4d6.png?v8",
            open_file_folder: "unicode/1f4c2.png?v8",
            open_hands: "unicode/1f450.png?v8",
            open_mouth: "unicode/1f62e.png?v8",
            open_umbrella: "unicode/2602.png?v8",
            ophiuchus: "unicode/26ce.png?v8",
            orange: "unicode/1f34a.png?v8",
            orange_book: "unicode/1f4d9.png?v8",
            orange_circle: "unicode/1f7e0.png?v8",
            orange_heart: "unicode/1f9e1.png?v8",
            orange_square: "unicode/1f7e7.png?v8",
            orangutan: "unicode/1f9a7.png?v8",
            orthodox_cross: "unicode/2626.png?v8",
            otter: "unicode/1f9a6.png?v8",
            outbox_tray: "unicode/1f4e4.png?v8",
            owl: "unicode/1f989.png?v8",
            ox: "unicode/1f402.png?v8",
            oyster: "unicode/1f9aa.png?v8",
            package: "unicode/1f4e6.png?v8",
            page_facing_up: "unicode/1f4c4.png?v8",
            page_with_curl: "unicode/1f4c3.png?v8",
            pager: "unicode/1f4df.png?v8",
            paintbrush: "unicode/1f58c.png?v8",
            pakistan: "unicode/1f1f5-1f1f0.png?v8",
            palau: "unicode/1f1f5-1f1fc.png?v8",
            palestinian_territories: "unicode/1f1f5-1f1f8.png?v8",
            palm_tree: "unicode/1f334.png?v8",
            palms_up_together: "unicode/1f932.png?v8",
            panama: "unicode/1f1f5-1f1e6.png?v8",
            pancakes: "unicode/1f95e.png?v8",
            panda_face: "unicode/1f43c.png?v8",
            paperclip: "unicode/1f4ce.png?v8",
            paperclips: "unicode/1f587.png?v8",
            papua_new_guinea: "unicode/1f1f5-1f1ec.png?v8",
            parachute: "unicode/1fa82.png?v8",
            paraguay: "unicode/1f1f5-1f1fe.png?v8",
            parasol_on_ground: "unicode/26f1.png?v8",
            parking: "unicode/1f17f.png?v8",
            parrot: "unicode/1f99c.png?v8",
            part_alternation_mark: "unicode/303d.png?v8",
            partly_sunny: "unicode/26c5.png?v8",
            partying_face: "unicode/1f973.png?v8",
            passenger_ship: "unicode/1f6f3.png?v8",
            passport_control: "unicode/1f6c2.png?v8",
            pause_button: "unicode/23f8.png?v8",
            paw_prints: "unicode/1f43e.png?v8",
            peace_symbol: "unicode/262e.png?v8",
            peach: "unicode/1f351.png?v8",
            peacock: "unicode/1f99a.png?v8",
            peanuts: "unicode/1f95c.png?v8",
            pear: "unicode/1f350.png?v8",
            pen: "unicode/1f58a.png?v8",
            pencil: "unicode/1f4dd.png?v8",
            pencil2: "unicode/270f.png?v8",
            penguin: "unicode/1f427.png?v8",
            pensive: "unicode/1f614.png?v8",
            people_holding_hands: "unicode/1f9d1-1f91d-1f9d1.png?v8",
            people_hugging: "unicode/1fac2.png?v8",
            performing_arts: "unicode/1f3ad.png?v8",
            persevere: "unicode/1f623.png?v8",
            person_bald: "unicode/1f9d1-1f9b2.png?v8",
            person_curly_hair: "unicode/1f9d1-1f9b1.png?v8",
            person_feeding_baby: "unicode/1f9d1-1f37c.png?v8",
            person_fencing: "unicode/1f93a.png?v8",
            person_in_manual_wheelchair: "unicode/1f9d1-1f9bd.png?v8",
            person_in_motorized_wheelchair: "unicode/1f9d1-1f9bc.png?v8",
            person_in_tuxedo: "unicode/1f935.png?v8",
            person_red_hair: "unicode/1f9d1-1f9b0.png?v8",
            person_white_hair: "unicode/1f9d1-1f9b3.png?v8",
            person_with_probing_cane: "unicode/1f9d1-1f9af.png?v8",
            person_with_turban: "unicode/1f473.png?v8",
            person_with_veil: "unicode/1f470.png?v8",
            peru: "unicode/1f1f5-1f1ea.png?v8",
            petri_dish: "unicode/1f9eb.png?v8",
            philippines: "unicode/1f1f5-1f1ed.png?v8",
            phone: "unicode/260e.png?v8",
            pick: "unicode/26cf.png?v8",
            pickup_truck: "unicode/1f6fb.png?v8",
            pie: "unicode/1f967.png?v8",
            pig: "unicode/1f437.png?v8",
            pig2: "unicode/1f416.png?v8",
            pig_nose: "unicode/1f43d.png?v8",
            pill: "unicode/1f48a.png?v8",
            pilot: "unicode/1f9d1-2708.png?v8",
            pinata: "unicode/1fa85.png?v8",
            pinched_fingers: "unicode/1f90c.png?v8",
            pinching_hand: "unicode/1f90f.png?v8",
            pineapple: "unicode/1f34d.png?v8",
            ping_pong: "unicode/1f3d3.png?v8",
            pirate_flag: "unicode/1f3f4-2620.png?v8",
            pisces: "unicode/2653.png?v8",
            pitcairn_islands: "unicode/1f1f5-1f1f3.png?v8",
            pizza: "unicode/1f355.png?v8",
            placard: "unicode/1faa7.png?v8",
            place_of_worship: "unicode/1f6d0.png?v8",
            plate_with_cutlery: "unicode/1f37d.png?v8",
            play_or_pause_button: "unicode/23ef.png?v8",
            pleading_face: "unicode/1f97a.png?v8",
            plunger: "unicode/1faa0.png?v8",
            point_down: "unicode/1f447.png?v8",
            point_left: "unicode/1f448.png?v8",
            point_right: "unicode/1f449.png?v8",
            point_up: "unicode/261d.png?v8",
            point_up_2: "unicode/1f446.png?v8",
            poland: "unicode/1f1f5-1f1f1.png?v8",
            polar_bear: "unicode/1f43b-2744.png?v8",
            police_car: "unicode/1f693.png?v8",
            police_officer: "unicode/1f46e.png?v8",
            policeman: "unicode/1f46e-2642.png?v8",
            policewoman: "unicode/1f46e-2640.png?v8",
            poodle: "unicode/1f429.png?v8",
            poop: "unicode/1f4a9.png?v8",
            popcorn: "unicode/1f37f.png?v8",
            portugal: "unicode/1f1f5-1f1f9.png?v8",
            post_office: "unicode/1f3e3.png?v8",
            postal_horn: "unicode/1f4ef.png?v8",
            postbox: "unicode/1f4ee.png?v8",
            potable_water: "unicode/1f6b0.png?v8",
            potato: "unicode/1f954.png?v8",
            potted_plant: "unicode/1fab4.png?v8",
            pouch: "unicode/1f45d.png?v8",
            poultry_leg: "unicode/1f357.png?v8",
            pound: "unicode/1f4b7.png?v8",
            pout: "unicode/1f621.png?v8",
            pouting_cat: "unicode/1f63e.png?v8",
            pouting_face: "unicode/1f64e.png?v8",
            pouting_man: "unicode/1f64e-2642.png?v8",
            pouting_woman: "unicode/1f64e-2640.png?v8",
            pray: "unicode/1f64f.png?v8",
            prayer_beads: "unicode/1f4ff.png?v8",
            pregnant_woman: "unicode/1f930.png?v8",
            pretzel: "unicode/1f968.png?v8",
            previous_track_button: "unicode/23ee.png?v8",
            prince: "unicode/1f934.png?v8",
            princess: "unicode/1f478.png?v8",
            printer: "unicode/1f5a8.png?v8",
            probing_cane: "unicode/1f9af.png?v8",
            puerto_rico: "unicode/1f1f5-1f1f7.png?v8",
            punch: "unicode/1f44a.png?v8",
            purple_circle: "unicode/1f7e3.png?v8",
            purple_heart: "unicode/1f49c.png?v8",
            purple_square: "unicode/1f7ea.png?v8",
            purse: "unicode/1f45b.png?v8",
            pushpin: "unicode/1f4cc.png?v8",
            put_litter_in_its_place: "unicode/1f6ae.png?v8",
            qatar: "unicode/1f1f6-1f1e6.png?v8",
            question: "unicode/2753.png?v8",
            rabbit: "unicode/1f430.png?v8",
            rabbit2: "unicode/1f407.png?v8",
            raccoon: "unicode/1f99d.png?v8",
            racehorse: "unicode/1f40e.png?v8",
            racing_car: "unicode/1f3ce.png?v8",
            radio: "unicode/1f4fb.png?v8",
            radio_button: "unicode/1f518.png?v8",
            radioactive: "unicode/2622.png?v8",
            rage: "unicode/1f621.png?v8",
            rage1: "rage1.png?v8",
            rage2: "rage2.png?v8",
            rage3: "rage3.png?v8",
            rage4: "rage4.png?v8",
            railway_car: "unicode/1f683.png?v8",
            railway_track: "unicode/1f6e4.png?v8",
            rainbow: "unicode/1f308.png?v8",
            rainbow_flag: "unicode/1f3f3-1f308.png?v8",
            raised_back_of_hand: "unicode/1f91a.png?v8",
            raised_eyebrow: "unicode/1f928.png?v8",
            raised_hand: "unicode/270b.png?v8",
            raised_hand_with_fingers_splayed: "unicode/1f590.png?v8",
            raised_hands: "unicode/1f64c.png?v8",
            raising_hand: "unicode/1f64b.png?v8",
            raising_hand_man: "unicode/1f64b-2642.png?v8",
            raising_hand_woman: "unicode/1f64b-2640.png?v8",
            ram: "unicode/1f40f.png?v8",
            ramen: "unicode/1f35c.png?v8",
            rat: "unicode/1f400.png?v8",
            razor: "unicode/1fa92.png?v8",
            receipt: "unicode/1f9fe.png?v8",
            record_button: "unicode/23fa.png?v8",
            recycle: "unicode/267b.png?v8",
            red_car: "unicode/1f697.png?v8",
            red_circle: "unicode/1f534.png?v8",
            red_envelope: "unicode/1f9e7.png?v8",
            red_haired_man: "unicode/1f468-1f9b0.png?v8",
            red_haired_woman: "unicode/1f469-1f9b0.png?v8",
            red_square: "unicode/1f7e5.png?v8",
            registered: "unicode/00ae.png?v8",
            relaxed: "unicode/263a.png?v8",
            relieved: "unicode/1f60c.png?v8",
            reminder_ribbon: "unicode/1f397.png?v8",
            repeat: "unicode/1f501.png?v8",
            repeat_one: "unicode/1f502.png?v8",
            rescue_worker_helmet: "unicode/26d1.png?v8",
            restroom: "unicode/1f6bb.png?v8",
            reunion: "unicode/1f1f7-1f1ea.png?v8",
            revolving_hearts: "unicode/1f49e.png?v8",
            rewind: "unicode/23ea.png?v8",
            rhinoceros: "unicode/1f98f.png?v8",
            ribbon: "unicode/1f380.png?v8",
            rice: "unicode/1f35a.png?v8",
            rice_ball: "unicode/1f359.png?v8",
            rice_cracker: "unicode/1f358.png?v8",
            rice_scene: "unicode/1f391.png?v8",
            right_anger_bubble: "unicode/1f5ef.png?v8",
            ring: "unicode/1f48d.png?v8",
            ringed_planet: "unicode/1fa90.png?v8",
            robot: "unicode/1f916.png?v8",
            rock: "unicode/1faa8.png?v8",
            rocket: "unicode/1f680.png?v8",
            rofl: "unicode/1f923.png?v8",
            roll_eyes: "unicode/1f644.png?v8",
            roll_of_paper: "unicode/1f9fb.png?v8",
            roller_coaster: "unicode/1f3a2.png?v8",
            roller_skate: "unicode/1f6fc.png?v8",
            romania: "unicode/1f1f7-1f1f4.png?v8",
            rooster: "unicode/1f413.png?v8",
            rose: "unicode/1f339.png?v8",
            rosette: "unicode/1f3f5.png?v8",
            rotating_light: "unicode/1f6a8.png?v8",
            round_pushpin: "unicode/1f4cd.png?v8",
            rowboat: "unicode/1f6a3.png?v8",
            rowing_man: "unicode/1f6a3-2642.png?v8",
            rowing_woman: "unicode/1f6a3-2640.png?v8",
            ru: "unicode/1f1f7-1f1fa.png?v8",
            rugby_football: "unicode/1f3c9.png?v8",
            runner: "unicode/1f3c3.png?v8",
            running: "unicode/1f3c3.png?v8",
            running_man: "unicode/1f3c3-2642.png?v8",
            running_shirt_with_sash: "unicode/1f3bd.png?v8",
            running_woman: "unicode/1f3c3-2640.png?v8",
            rwanda: "unicode/1f1f7-1f1fc.png?v8",
            sa: "unicode/1f202.png?v8",
            safety_pin: "unicode/1f9f7.png?v8",
            safety_vest: "unicode/1f9ba.png?v8",
            sagittarius: "unicode/2650.png?v8",
            sailboat: "unicode/26f5.png?v8",
            sake: "unicode/1f376.png?v8",
            salt: "unicode/1f9c2.png?v8",
            samoa: "unicode/1f1fc-1f1f8.png?v8",
            san_marino: "unicode/1f1f8-1f1f2.png?v8",
            sandal: "unicode/1f461.png?v8",
            sandwich: "unicode/1f96a.png?v8",
            santa: "unicode/1f385.png?v8",
            sao_tome_principe: "unicode/1f1f8-1f1f9.png?v8",
            sari: "unicode/1f97b.png?v8",
            sassy_man: "unicode/1f481-2642.png?v8",
            sassy_woman: "unicode/1f481-2640.png?v8",
            satellite: "unicode/1f4e1.png?v8",
            satisfied: "unicode/1f606.png?v8",
            saudi_arabia: "unicode/1f1f8-1f1e6.png?v8",
            sauna_man: "unicode/1f9d6-2642.png?v8",
            sauna_person: "unicode/1f9d6.png?v8",
            sauna_woman: "unicode/1f9d6-2640.png?v8",
            sauropod: "unicode/1f995.png?v8",
            saxophone: "unicode/1f3b7.png?v8",
            scarf: "unicode/1f9e3.png?v8",
            school: "unicode/1f3eb.png?v8",
            school_satchel: "unicode/1f392.png?v8",
            scientist: "unicode/1f9d1-1f52c.png?v8",
            scissors: "unicode/2702.png?v8",
            scorpion: "unicode/1f982.png?v8",
            scorpius: "unicode/264f.png?v8",
            scotland: "unicode/1f3f4-e0067-e0062-e0073-e0063-e0074-e007f.png?v8",
            scream: "unicode/1f631.png?v8",
            scream_cat: "unicode/1f640.png?v8",
            screwdriver: "unicode/1fa9b.png?v8",
            scroll: "unicode/1f4dc.png?v8",
            seal: "unicode/1f9ad.png?v8",
            seat: "unicode/1f4ba.png?v8",
            secret: "unicode/3299.png?v8",
            see_no_evil: "unicode/1f648.png?v8",
            seedling: "unicode/1f331.png?v8",
            selfie: "unicode/1f933.png?v8",
            senegal: "unicode/1f1f8-1f1f3.png?v8",
            serbia: "unicode/1f1f7-1f1f8.png?v8",
            service_dog: "unicode/1f415-1f9ba.png?v8",
            seven: "unicode/0037-20e3.png?v8",
            sewing_needle: "unicode/1faa1.png?v8",
            seychelles: "unicode/1f1f8-1f1e8.png?v8",
            shallow_pan_of_food: "unicode/1f958.png?v8",
            shamrock: "unicode/2618.png?v8",
            shark: "unicode/1f988.png?v8",
            shaved_ice: "unicode/1f367.png?v8",
            sheep: "unicode/1f411.png?v8",
            shell: "unicode/1f41a.png?v8",
            shield: "unicode/1f6e1.png?v8",
            shinto_shrine: "unicode/26e9.png?v8",
            ship: "unicode/1f6a2.png?v8",
            shipit: "shipit.png?v8",
            shirt: "unicode/1f455.png?v8",
            shit: "unicode/1f4a9.png?v8",
            shoe: "unicode/1f45e.png?v8",
            shopping: "unicode/1f6cd.png?v8",
            shopping_cart: "unicode/1f6d2.png?v8",
            shorts: "unicode/1fa73.png?v8",
            shower: "unicode/1f6bf.png?v8",
            shrimp: "unicode/1f990.png?v8",
            shrug: "unicode/1f937.png?v8",
            shushing_face: "unicode/1f92b.png?v8",
            sierra_leone: "unicode/1f1f8-1f1f1.png?v8",
            signal_strength: "unicode/1f4f6.png?v8",
            singapore: "unicode/1f1f8-1f1ec.png?v8",
            singer: "unicode/1f9d1-1f3a4.png?v8",
            sint_maarten: "unicode/1f1f8-1f1fd.png?v8",
            six: "unicode/0036-20e3.png?v8",
            six_pointed_star: "unicode/1f52f.png?v8",
            skateboard: "unicode/1f6f9.png?v8",
            ski: "unicode/1f3bf.png?v8",
            skier: "unicode/26f7.png?v8",
            skull: "unicode/1f480.png?v8",
            skull_and_crossbones: "unicode/2620.png?v8",
            skunk: "unicode/1f9a8.png?v8",
            sled: "unicode/1f6f7.png?v8",
            sleeping: "unicode/1f634.png?v8",
            sleeping_bed: "unicode/1f6cc.png?v8",
            sleepy: "unicode/1f62a.png?v8",
            slightly_frowning_face: "unicode/1f641.png?v8",
            slightly_smiling_face: "unicode/1f642.png?v8",
            slot_machine: "unicode/1f3b0.png?v8",
            sloth: "unicode/1f9a5.png?v8",
            slovakia: "unicode/1f1f8-1f1f0.png?v8",
            slovenia: "unicode/1f1f8-1f1ee.png?v8",
            small_airplane: "unicode/1f6e9.png?v8",
            small_blue_diamond: "unicode/1f539.png?v8",
            small_orange_diamond: "unicode/1f538.png?v8",
            small_red_triangle: "unicode/1f53a.png?v8",
            small_red_triangle_down: "unicode/1f53b.png?v8",
            smile: "unicode/1f604.png?v8",
            smile_cat: "unicode/1f638.png?v8",
            smiley: "unicode/1f603.png?v8",
            smiley_cat: "unicode/1f63a.png?v8",
            smiling_face_with_tear: "unicode/1f972.png?v8",
            smiling_face_with_three_hearts: "unicode/1f970.png?v8",
            smiling_imp: "unicode/1f608.png?v8",
            smirk: "unicode/1f60f.png?v8",
            smirk_cat: "unicode/1f63c.png?v8",
            smoking: "unicode/1f6ac.png?v8",
            snail: "unicode/1f40c.png?v8",
            snake: "unicode/1f40d.png?v8",
            sneezing_face: "unicode/1f927.png?v8",
            snowboarder: "unicode/1f3c2.png?v8",
            snowflake: "unicode/2744.png?v8",
            snowman: "unicode/26c4.png?v8",
            snowman_with_snow: "unicode/2603.png?v8",
            soap: "unicode/1f9fc.png?v8",
            sob: "unicode/1f62d.png?v8",
            soccer: "unicode/26bd.png?v8",
            socks: "unicode/1f9e6.png?v8",
            softball: "unicode/1f94e.png?v8",
            solomon_islands: "unicode/1f1f8-1f1e7.png?v8",
            somalia: "unicode/1f1f8-1f1f4.png?v8",
            soon: "unicode/1f51c.png?v8",
            sos: "unicode/1f198.png?v8",
            sound: "unicode/1f509.png?v8",
            south_africa: "unicode/1f1ff-1f1e6.png?v8",
            south_georgia_south_sandwich_islands: "unicode/1f1ec-1f1f8.png?v8",
            south_sudan: "unicode/1f1f8-1f1f8.png?v8",
            space_invader: "unicode/1f47e.png?v8",
            spades: "unicode/2660.png?v8",
            spaghetti: "unicode/1f35d.png?v8",
            sparkle: "unicode/2747.png?v8",
            sparkler: "unicode/1f387.png?v8",
            sparkles: "unicode/2728.png?v8",
            sparkling_heart: "unicode/1f496.png?v8",
            speak_no_evil: "unicode/1f64a.png?v8",
            speaker: "unicode/1f508.png?v8",
            speaking_head: "unicode/1f5e3.png?v8",
            speech_balloon: "unicode/1f4ac.png?v8",
            speedboat: "unicode/1f6a4.png?v8",
            spider: "unicode/1f577.png?v8",
            spider_web: "unicode/1f578.png?v8",
            spiral_calendar: "unicode/1f5d3.png?v8",
            spiral_notepad: "unicode/1f5d2.png?v8",
            sponge: "unicode/1f9fd.png?v8",
            spoon: "unicode/1f944.png?v8",
            squid: "unicode/1f991.png?v8",
            sri_lanka: "unicode/1f1f1-1f1f0.png?v8",
            st_barthelemy: "unicode/1f1e7-1f1f1.png?v8",
            st_helena: "unicode/1f1f8-1f1ed.png?v8",
            st_kitts_nevis: "unicode/1f1f0-1f1f3.png?v8",
            st_lucia: "unicode/1f1f1-1f1e8.png?v8",
            st_martin: "unicode/1f1f2-1f1eb.png?v8",
            st_pierre_miquelon: "unicode/1f1f5-1f1f2.png?v8",
            st_vincent_grenadines: "unicode/1f1fb-1f1e8.png?v8",
            stadium: "unicode/1f3df.png?v8",
            standing_man: "unicode/1f9cd-2642.png?v8",
            standing_person: "unicode/1f9cd.png?v8",
            standing_woman: "unicode/1f9cd-2640.png?v8",
            star: "unicode/2b50.png?v8",
            star2: "unicode/1f31f.png?v8",
            star_and_crescent: "unicode/262a.png?v8",
            star_of_david: "unicode/2721.png?v8",
            star_struck: "unicode/1f929.png?v8",
            stars: "unicode/1f320.png?v8",
            station: "unicode/1f689.png?v8",
            statue_of_liberty: "unicode/1f5fd.png?v8",
            steam_locomotive: "unicode/1f682.png?v8",
            stethoscope: "unicode/1fa7a.png?v8",
            stew: "unicode/1f372.png?v8",
            stop_button: "unicode/23f9.png?v8",
            stop_sign: "unicode/1f6d1.png?v8",
            stopwatch: "unicode/23f1.png?v8",
            straight_ruler: "unicode/1f4cf.png?v8",
            strawberry: "unicode/1f353.png?v8",
            stuck_out_tongue: "unicode/1f61b.png?v8",
            stuck_out_tongue_closed_eyes: "unicode/1f61d.png?v8",
            stuck_out_tongue_winking_eye: "unicode/1f61c.png?v8",
            student: "unicode/1f9d1-1f393.png?v8",
            studio_microphone: "unicode/1f399.png?v8",
            stuffed_flatbread: "unicode/1f959.png?v8",
            sudan: "unicode/1f1f8-1f1e9.png?v8",
            sun_behind_large_cloud: "unicode/1f325.png?v8",
            sun_behind_rain_cloud: "unicode/1f326.png?v8",
            sun_behind_small_cloud: "unicode/1f324.png?v8",
            sun_with_face: "unicode/1f31e.png?v8",
            sunflower: "unicode/1f33b.png?v8",
            sunglasses: "unicode/1f60e.png?v8",
            sunny: "unicode/2600.png?v8",
            sunrise: "unicode/1f305.png?v8",
            sunrise_over_mountains: "unicode/1f304.png?v8",
            superhero: "unicode/1f9b8.png?v8",
            superhero_man: "unicode/1f9b8-2642.png?v8",
            superhero_woman: "unicode/1f9b8-2640.png?v8",
            supervillain: "unicode/1f9b9.png?v8",
            supervillain_man: "unicode/1f9b9-2642.png?v8",
            supervillain_woman: "unicode/1f9b9-2640.png?v8",
            surfer: "unicode/1f3c4.png?v8",
            surfing_man: "unicode/1f3c4-2642.png?v8",
            surfing_woman: "unicode/1f3c4-2640.png?v8",
            suriname: "unicode/1f1f8-1f1f7.png?v8",
            sushi: "unicode/1f363.png?v8",
            suspect: "suspect.png?v8",
            suspension_railway: "unicode/1f69f.png?v8",
            svalbard_jan_mayen: "unicode/1f1f8-1f1ef.png?v8",
            swan: "unicode/1f9a2.png?v8",
            swaziland: "unicode/1f1f8-1f1ff.png?v8",
            sweat: "unicode/1f613.png?v8",
            sweat_drops: "unicode/1f4a6.png?v8",
            sweat_smile: "unicode/1f605.png?v8",
            sweden: "unicode/1f1f8-1f1ea.png?v8",
            sweet_potato: "unicode/1f360.png?v8",
            swim_brief: "unicode/1fa72.png?v8",
            swimmer: "unicode/1f3ca.png?v8",
            swimming_man: "unicode/1f3ca-2642.png?v8",
            swimming_woman: "unicode/1f3ca-2640.png?v8",
            switzerland: "unicode/1f1e8-1f1ed.png?v8",
            symbols: "unicode/1f523.png?v8",
            synagogue: "unicode/1f54d.png?v8",
            syria: "unicode/1f1f8-1f1fe.png?v8",
            syringe: "unicode/1f489.png?v8",
            "t-rex": "unicode/1f996.png?v8",
            taco: "unicode/1f32e.png?v8",
            tada: "unicode/1f389.png?v8",
            taiwan: "unicode/1f1f9-1f1fc.png?v8",
            tajikistan: "unicode/1f1f9-1f1ef.png?v8",
            takeout_box: "unicode/1f961.png?v8",
            tamale: "unicode/1fad4.png?v8",
            tanabata_tree: "unicode/1f38b.png?v8",
            tangerine: "unicode/1f34a.png?v8",
            tanzania: "unicode/1f1f9-1f1ff.png?v8",
            taurus: "unicode/2649.png?v8",
            taxi: "unicode/1f695.png?v8",
            tea: "unicode/1f375.png?v8",
            teacher: "unicode/1f9d1-1f3eb.png?v8",
            teapot: "unicode/1fad6.png?v8",
            technologist: "unicode/1f9d1-1f4bb.png?v8",
            teddy_bear: "unicode/1f9f8.png?v8",
            telephone: "unicode/260e.png?v8",
            telephone_receiver: "unicode/1f4de.png?v8",
            telescope: "unicode/1f52d.png?v8",
            tennis: "unicode/1f3be.png?v8",
            tent: "unicode/26fa.png?v8",
            test_tube: "unicode/1f9ea.png?v8",
            thailand: "unicode/1f1f9-1f1ed.png?v8",
            thermometer: "unicode/1f321.png?v8",
            thinking: "unicode/1f914.png?v8",
            thong_sandal: "unicode/1fa74.png?v8",
            thought_balloon: "unicode/1f4ad.png?v8",
            thread: "unicode/1f9f5.png?v8",
            three: "unicode/0033-20e3.png?v8",
            thumbsdown: "unicode/1f44e.png?v8",
            thumbsup: "unicode/1f44d.png?v8",
            ticket: "unicode/1f3ab.png?v8",
            tickets: "unicode/1f39f.png?v8",
            tiger: "unicode/1f42f.png?v8",
            tiger2: "unicode/1f405.png?v8",
            timer_clock: "unicode/23f2.png?v8",
            timor_leste: "unicode/1f1f9-1f1f1.png?v8",
            tipping_hand_man: "unicode/1f481-2642.png?v8",
            tipping_hand_person: "unicode/1f481.png?v8",
            tipping_hand_woman: "unicode/1f481-2640.png?v8",
            tired_face: "unicode/1f62b.png?v8",
            tm: "unicode/2122.png?v8",
            togo: "unicode/1f1f9-1f1ec.png?v8",
            toilet: "unicode/1f6bd.png?v8",
            tokelau: "unicode/1f1f9-1f1f0.png?v8",
            tokyo_tower: "unicode/1f5fc.png?v8",
            tomato: "unicode/1f345.png?v8",
            tonga: "unicode/1f1f9-1f1f4.png?v8",
            tongue: "unicode/1f445.png?v8",
            toolbox: "unicode/1f9f0.png?v8",
            tooth: "unicode/1f9b7.png?v8",
            toothbrush: "unicode/1faa5.png?v8",
            top: "unicode/1f51d.png?v8",
            tophat: "unicode/1f3a9.png?v8",
            tornado: "unicode/1f32a.png?v8",
            tr: "unicode/1f1f9-1f1f7.png?v8",
            trackball: "unicode/1f5b2.png?v8",
            tractor: "unicode/1f69c.png?v8",
            traffic_light: "unicode/1f6a5.png?v8",
            train: "unicode/1f68b.png?v8",
            train2: "unicode/1f686.png?v8",
            tram: "unicode/1f68a.png?v8",
            transgender_flag: "unicode/1f3f3-26a7.png?v8",
            transgender_symbol: "unicode/26a7.png?v8",
            triangular_flag_on_post: "unicode/1f6a9.png?v8",
            triangular_ruler: "unicode/1f4d0.png?v8",
            trident: "unicode/1f531.png?v8",
            trinidad_tobago: "unicode/1f1f9-1f1f9.png?v8",
            tristan_da_cunha: "unicode/1f1f9-1f1e6.png?v8",
            triumph: "unicode/1f624.png?v8",
            trolleybus: "unicode/1f68e.png?v8",
            trollface: "trollface.png?v8",
            trophy: "unicode/1f3c6.png?v8",
            tropical_drink: "unicode/1f379.png?v8",
            tropical_fish: "unicode/1f420.png?v8",
            truck: "unicode/1f69a.png?v8",
            trumpet: "unicode/1f3ba.png?v8",
            tshirt: "unicode/1f455.png?v8",
            tulip: "unicode/1f337.png?v8",
            tumbler_glass: "unicode/1f943.png?v8",
            tunisia: "unicode/1f1f9-1f1f3.png?v8",
            turkey: "unicode/1f983.png?v8",
            turkmenistan: "unicode/1f1f9-1f1f2.png?v8",
            turks_caicos_islands: "unicode/1f1f9-1f1e8.png?v8",
            turtle: "unicode/1f422.png?v8",
            tuvalu: "unicode/1f1f9-1f1fb.png?v8",
            tv: "unicode/1f4fa.png?v8",
            twisted_rightwards_arrows: "unicode/1f500.png?v8",
            two: "unicode/0032-20e3.png?v8",
            two_hearts: "unicode/1f495.png?v8",
            two_men_holding_hands: "unicode/1f46c.png?v8",
            two_women_holding_hands: "unicode/1f46d.png?v8",
            u5272: "unicode/1f239.png?v8",
            u5408: "unicode/1f234.png?v8",
            u55b6: "unicode/1f23a.png?v8",
            u6307: "unicode/1f22f.png?v8",
            u6708: "unicode/1f237.png?v8",
            u6709: "unicode/1f236.png?v8",
            u6e80: "unicode/1f235.png?v8",
            u7121: "unicode/1f21a.png?v8",
            u7533: "unicode/1f238.png?v8",
            u7981: "unicode/1f232.png?v8",
            u7a7a: "unicode/1f233.png?v8",
            uganda: "unicode/1f1fa-1f1ec.png?v8",
            uk: "unicode/1f1ec-1f1e7.png?v8",
            ukraine: "unicode/1f1fa-1f1e6.png?v8",
            umbrella: "unicode/2614.png?v8",
            unamused: "unicode/1f612.png?v8",
            underage: "unicode/1f51e.png?v8",
            unicorn: "unicode/1f984.png?v8",
            united_arab_emirates: "unicode/1f1e6-1f1ea.png?v8",
            united_nations: "unicode/1f1fa-1f1f3.png?v8",
            unlock: "unicode/1f513.png?v8",
            up: "unicode/1f199.png?v8",
            upside_down_face: "unicode/1f643.png?v8",
            uruguay: "unicode/1f1fa-1f1fe.png?v8",
            us: "unicode/1f1fa-1f1f8.png?v8",
            us_outlying_islands: "unicode/1f1fa-1f1f2.png?v8",
            us_virgin_islands: "unicode/1f1fb-1f1ee.png?v8",
            uzbekistan: "unicode/1f1fa-1f1ff.png?v8",
            v: "unicode/270c.png?v8",
            vampire: "unicode/1f9db.png?v8",
            vampire_man: "unicode/1f9db-2642.png?v8",
            vampire_woman: "unicode/1f9db-2640.png?v8",
            vanuatu: "unicode/1f1fb-1f1fa.png?v8",
            vatican_city: "unicode/1f1fb-1f1e6.png?v8",
            venezuela: "unicode/1f1fb-1f1ea.png?v8",
            vertical_traffic_light: "unicode/1f6a6.png?v8",
            vhs: "unicode/1f4fc.png?v8",
            vibration_mode: "unicode/1f4f3.png?v8",
            video_camera: "unicode/1f4f9.png?v8",
            video_game: "unicode/1f3ae.png?v8",
            vietnam: "unicode/1f1fb-1f1f3.png?v8",
            violin: "unicode/1f3bb.png?v8",
            virgo: "unicode/264d.png?v8",
            volcano: "unicode/1f30b.png?v8",
            volleyball: "unicode/1f3d0.png?v8",
            vomiting_face: "unicode/1f92e.png?v8",
            vs: "unicode/1f19a.png?v8",
            vulcan_salute: "unicode/1f596.png?v8",
            waffle: "unicode/1f9c7.png?v8",
            wales: "unicode/1f3f4-e0067-e0062-e0077-e006c-e0073-e007f.png?v8",
            walking: "unicode/1f6b6.png?v8",
            walking_man: "unicode/1f6b6-2642.png?v8",
            walking_woman: "unicode/1f6b6-2640.png?v8",
            wallis_futuna: "unicode/1f1fc-1f1eb.png?v8",
            waning_crescent_moon: "unicode/1f318.png?v8",
            waning_gibbous_moon: "unicode/1f316.png?v8",
            warning: "unicode/26a0.png?v8",
            wastebasket: "unicode/1f5d1.png?v8",
            watch: "unicode/231a.png?v8",
            water_buffalo: "unicode/1f403.png?v8",
            water_polo: "unicode/1f93d.png?v8",
            watermelon: "unicode/1f349.png?v8",
            wave: "unicode/1f44b.png?v8",
            wavy_dash: "unicode/3030.png?v8",
            waxing_crescent_moon: "unicode/1f312.png?v8",
            waxing_gibbous_moon: "unicode/1f314.png?v8",
            wc: "unicode/1f6be.png?v8",
            weary: "unicode/1f629.png?v8",
            wedding: "unicode/1f492.png?v8",
            weight_lifting: "unicode/1f3cb.png?v8",
            weight_lifting_man: "unicode/1f3cb-2642.png?v8",
            weight_lifting_woman: "unicode/1f3cb-2640.png?v8",
            western_sahara: "unicode/1f1ea-1f1ed.png?v8",
            whale: "unicode/1f433.png?v8",
            whale2: "unicode/1f40b.png?v8",
            wheel_of_dharma: "unicode/2638.png?v8",
            wheelchair: "unicode/267f.png?v8",
            white_check_mark: "unicode/2705.png?v8",
            white_circle: "unicode/26aa.png?v8",
            white_flag: "unicode/1f3f3.png?v8",
            white_flower: "unicode/1f4ae.png?v8",
            white_haired_man: "unicode/1f468-1f9b3.png?v8",
            white_haired_woman: "unicode/1f469-1f9b3.png?v8",
            white_heart: "unicode/1f90d.png?v8",
            white_large_square: "unicode/2b1c.png?v8",
            white_medium_small_square: "unicode/25fd.png?v8",
            white_medium_square: "unicode/25fb.png?v8",
            white_small_square: "unicode/25ab.png?v8",
            white_square_button: "unicode/1f533.png?v8",
            wilted_flower: "unicode/1f940.png?v8",
            wind_chime: "unicode/1f390.png?v8",
            wind_face: "unicode/1f32c.png?v8",
            window: "unicode/1fa9f.png?v8",
            wine_glass: "unicode/1f377.png?v8",
            wink: "unicode/1f609.png?v8",
            wolf: "unicode/1f43a.png?v8",
            woman: "unicode/1f469.png?v8",
            woman_artist: "unicode/1f469-1f3a8.png?v8",
            woman_astronaut: "unicode/1f469-1f680.png?v8",
            woman_beard: "unicode/1f9d4-2640.png?v8",
            woman_cartwheeling: "unicode/1f938-2640.png?v8",
            woman_cook: "unicode/1f469-1f373.png?v8",
            woman_dancing: "unicode/1f483.png?v8",
            woman_facepalming: "unicode/1f926-2640.png?v8",
            woman_factory_worker: "unicode/1f469-1f3ed.png?v8",
            woman_farmer: "unicode/1f469-1f33e.png?v8",
            woman_feeding_baby: "unicode/1f469-1f37c.png?v8",
            woman_firefighter: "unicode/1f469-1f692.png?v8",
            woman_health_worker: "unicode/1f469-2695.png?v8",
            woman_in_manual_wheelchair: "unicode/1f469-1f9bd.png?v8",
            woman_in_motorized_wheelchair: "unicode/1f469-1f9bc.png?v8",
            woman_in_tuxedo: "unicode/1f935-2640.png?v8",
            woman_judge: "unicode/1f469-2696.png?v8",
            woman_juggling: "unicode/1f939-2640.png?v8",
            woman_mechanic: "unicode/1f469-1f527.png?v8",
            woman_office_worker: "unicode/1f469-1f4bc.png?v8",
            woman_pilot: "unicode/1f469-2708.png?v8",
            woman_playing_handball: "unicode/1f93e-2640.png?v8",
            woman_playing_water_polo: "unicode/1f93d-2640.png?v8",
            woman_scientist: "unicode/1f469-1f52c.png?v8",
            woman_shrugging: "unicode/1f937-2640.png?v8",
            woman_singer: "unicode/1f469-1f3a4.png?v8",
            woman_student: "unicode/1f469-1f393.png?v8",
            woman_teacher: "unicode/1f469-1f3eb.png?v8",
            woman_technologist: "unicode/1f469-1f4bb.png?v8",
            woman_with_headscarf: "unicode/1f9d5.png?v8",
            woman_with_probing_cane: "unicode/1f469-1f9af.png?v8",
            woman_with_turban: "unicode/1f473-2640.png?v8",
            woman_with_veil: "unicode/1f470-2640.png?v8",
            womans_clothes: "unicode/1f45a.png?v8",
            womans_hat: "unicode/1f452.png?v8",
            women_wrestling: "unicode/1f93c-2640.png?v8",
            womens: "unicode/1f6ba.png?v8",
            wood: "unicode/1fab5.png?v8",
            woozy_face: "unicode/1f974.png?v8",
            world_map: "unicode/1f5fa.png?v8",
            worm: "unicode/1fab1.png?v8",
            worried: "unicode/1f61f.png?v8",
            wrench: "unicode/1f527.png?v8",
            wrestling: "unicode/1f93c.png?v8",
            writing_hand: "unicode/270d.png?v8",
            x: "unicode/274c.png?v8",
            yarn: "unicode/1f9f6.png?v8",
            yawning_face: "unicode/1f971.png?v8",
            yellow_circle: "unicode/1f7e1.png?v8",
            yellow_heart: "unicode/1f49b.png?v8",
            yellow_square: "unicode/1f7e8.png?v8",
            yemen: "unicode/1f1fe-1f1ea.png?v8",
            yen: "unicode/1f4b4.png?v8",
            yin_yang: "unicode/262f.png?v8",
            yo_yo: "unicode/1fa80.png?v8",
            yum: "unicode/1f60b.png?v8",
            zambia: "unicode/1f1ff-1f1f2.png?v8",
            zany_face: "unicode/1f92a.png?v8",
            zap: "unicode/26a1.png?v8",
            zebra: "unicode/1f993.png?v8",
            zero: "unicode/0030-20e3.png?v8",
            zimbabwe: "unicode/1f1ff-1f1fc.png?v8",
            zipper_mouth_face: "unicode/1f910.png?v8",
            zombie: "unicode/1f9df.png?v8",
            zombie_man: "unicode/1f9df-2642.png?v8",
            zombie_woman: "unicode/1f9df-2640.png?v8",
            zzz: "unicode/1f4a4.png?v8"
        }
    };
    function jn(e, t) {
        return e.replace(/<(code|pre|script|template)[^>]*?>[\s\S]+?<\/(code|pre|script|template)>/g, function (e) {
            return e.replace(/:/g, "__colon__")
        }).replace(/<!--[\s\S]+?-->/g, function (e) {
            return e.replace(/:/g, "__colon__")
        }).replace(/([a-z]{2,}:)?\/\/[^\s'">)]+/gi, function (e) {
            return e.replace(/:/g, "__colon__")
        }).replace(/:([a-z0-9_\-+]+?):/g, function (e, n) {
            return i = e,
                o = n,
                e = t,
                n = Cn.data[o],
                i,
                i = n ? e && /unicode/.test(n) ? '<span class="emoji">' + n.replace("unicode/", "").replace(/\.png.*/, "").split("-").map(function (e) {
                    return "&#x" + e + ";"
                }).join("&zwj;").concat("&#xFE0E;") + "</span>" : '<img src="' + Cn.baseURL + n + '.png" alt="' + o + '" class="emoji" loading="lazy">' : i;
            var i, o
        }).replace(/__colon__/g, ":")
    }
    function Ln(e) {
        var o = {};
        return {
            str: e = (e = void 0 === e ? "" : e) && e.replace(/^('|")/, "").replace(/('|")$/, "").replace(/(?:^|\s):([\w-]+:?)=?([\w-%]+)?/g, function (e, n, i) {
                return -1 === n.indexOf(":") ? (o[n] = i && i.replace(/&quot;/g, "") || !0,
                    "") : e
            }).trim(),
            config: o
        }
    }
    function On(e) {
        return (e = void 0 === e ? "" : e).replace(/(<\/?a.*?>)/gi, "")
    }
    var qn, Pn = be(function (e) {
        var u, f, p, d, n, g = function (u) {
            var i = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i
                , n = 0
                , e = {}
                , R = {
                    manual: u.Prism && u.Prism.manual,
                    disableWorkerMessageHandler: u.Prism && u.Prism.disableWorkerMessageHandler,
                    util: {
                        encode: function e(n) {
                            return n instanceof T ? new T(n.type, e(n.content), n.alias) : Array.isArray(n) ? n.map(e) : n.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ")
                        },
                        type: function (e) {
                            return Object.prototype.toString.call(e).slice(8, -1)
                        },
                        objId: function (e) {
                            return e.__id || Object.defineProperty(e, "__id", {
                                value: ++n
                            }),
                                e.__id
                        },
                        clone: function i(e, o) {
                            var t, n;
                            switch (o = o || {},
                            R.util.type(e)) {
                                case "Object":
                                    if (n = R.util.objId(e),
                                        o[n])
                                        return o[n];
                                    for (var a in t = {},
                                        o[n] = t,
                                        e)
                                        e.hasOwnProperty(a) && (t[a] = i(e[a], o));
                                    return t;
                                case "Array":
                                    return (n = R.util.objId(e),
                                        o[n]) ? o[n] : (t = [],
                                            o[n] = t,
                                            e.forEach(function (e, n) {
                                                t[n] = i(e, o)
                                            }),
                                            t);
                                default:
                                    return e
                            }
                        },
                        getLanguage: function (e) {
                            for (; e;) {
                                var n = i.exec(e.className);
                                if (n)
                                    return n[1].toLowerCase();
                                e = e.parentElement
                            }
                            return "none"
                        },
                        setLanguage: function (e, n) {
                            e.className = e.className.replace(RegExp(i, "gi"), ""),
                                e.classList.add("language-" + n)
                        },
                        currentScript: function () {
                            if ("undefined" == typeof document)
                                return null;
                            if ("currentScript" in document)
                                return document.currentScript;
                            try {
                                throw new Error
                            } catch (e) {
                                var n = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(e.stack) || [])[1];
                                if (n) {
                                    var i, o = document.getElementsByTagName("script");
                                    for (i in o)
                                        if (o[i].src == n)
                                            return o[i]
                                }
                                return null
                            }
                        },
                        isActive: function (e, n, i) {
                            for (var o = "no-" + n; e;) {
                                var t = e.classList;
                                if (t.contains(n))
                                    return !0;
                                if (t.contains(o))
                                    return !1;
                                e = e.parentElement
                            }
                            return !!i
                        }
                    },
                    languages: {
                        plain: e,
                        plaintext: e,
                        text: e,
                        txt: e,
                        extend: function (e, n) {
                            var i, o = R.util.clone(R.languages[e]);
                            for (i in n)
                                o[i] = n[i];
                            return o
                        },
                        insertBefore: function (i, e, n, o) {
                            var t, a = (o = o || R.languages)[i], r = {};
                            for (t in a)
                                if (a.hasOwnProperty(t)) {
                                    if (t == e)
                                        for (var c in n)
                                            n.hasOwnProperty(c) && (r[c] = n[c]);
                                    n.hasOwnProperty(t) || (r[t] = a[t])
                                }
                            var u = o[i];
                            return o[i] = r,
                                R.languages.DFS(R.languages, function (e, n) {
                                    n === u && e != i && (this[e] = r)
                                }),
                                r
                        },
                        DFS: function e(n, i, o, t) {
                            t = t || {};
                            var a, r, c, u = R.util.objId;
                            for (a in n)
                                n.hasOwnProperty(a) && (i.call(n, a, n[a], o || a),
                                    r = n[a],
                                    "Object" !== (c = R.util.type(r)) || t[u(r)] ? "Array" !== c || t[u(r)] || (t[u(r)] = !0,
                                        e(r, i, a, t)) : (t[u(r)] = !0,
                                            e(r, i, null, t)))
                        }
                    },
                    plugins: {},
                    highlightAll: function (e, n) {
                        R.highlightAllUnder(document, e, n)
                    },
                    highlightAllUnder: function (e, n, i) {
                        var o = {
                            callback: i,
                            container: e,
                            selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
                        };
                        R.hooks.run("before-highlightall", o),
                            o.elements = Array.prototype.slice.apply(o.container.querySelectorAll(o.selector)),
                            R.hooks.run("before-all-elements-highlight", o);
                        for (var t, a = 0; t = o.elements[a++];)
                            R.highlightElement(t, !0 === n, o.callback)
                    },
                    highlightElement: function (e, n, i) {
                        var o = R.util.getLanguage(e)
                            , t = R.languages[o];
                        R.util.setLanguage(e, o);
                        var a = e.parentElement;
                        a && "pre" === a.nodeName.toLowerCase() && R.util.setLanguage(a, o);
                        var r = {
                            element: e,
                            language: o,
                            grammar: t,
                            code: e.textContent
                        };
                        function c(e) {
                            r.highlightedCode = e,
                                R.hooks.run("before-insert", r),
                                r.element.innerHTML = r.highlightedCode,
                                R.hooks.run("after-highlight", r),
                                R.hooks.run("complete", r),
                                i && i.call(r.element)
                        }
                        if (R.hooks.run("before-sanity-check", r),
                            (a = r.element.parentElement) && "pre" === a.nodeName.toLowerCase() && !a.hasAttribute("tabindex") && a.setAttribute("tabindex", "0"),
                            !r.code)
                            return R.hooks.run("complete", r),
                                void (i && i.call(r.element));
                        R.hooks.run("before-highlight", r),
                            r.grammar ? n && u.Worker ? ((n = new Worker(R.filename)).onmessage = function (e) {
                                c(e.data)
                            }
                                ,
                                n.postMessage(JSON.stringify({
                                    language: r.language,
                                    code: r.code,
                                    immediateClose: !0
                                }))) : c(R.highlight(r.code, r.grammar, r.language)) : c(R.util.encode(r.code))
                    },
                    highlight: function (e, n, i) {
                        i = {
                            code: e,
                            grammar: n,
                            language: i
                        };
                        if (R.hooks.run("before-tokenize", i),
                            !i.grammar)
                            throw new Error('The language "' + i.language + '" has no grammar.');
                        return i.tokens = R.tokenize(i.code, i.grammar),
                            R.hooks.run("after-tokenize", i),
                            T.stringify(R.util.encode(i.tokens), i.language)
                    },
                    tokenize: function (e, n) {
                        var i = n.rest;
                        if (i) {
                            for (var o in i)
                                n[o] = i[o];
                            delete n.rest
                        }
                        var t = new a;
                        return j(t, t.head, e),
                            function e(n, i, o, t, a, r) {
                                for (var c in o)
                                    if (o.hasOwnProperty(c) && o[c]) {
                                        var u = o[c];
                                        u = Array.isArray(u) ? u : [u];
                                        for (var f = 0; f < u.length; ++f) {
                                            if (r && r.cause == c + "," + f)
                                                return;
                                            var p, d = u[f], g = d.inside, s = !!d.lookbehind, l = !!d.greedy, v = d.alias;
                                            l && !d.pattern.global && (p = d.pattern.toString().match(/[imsuy]*$/)[0],
                                                d.pattern = RegExp(d.pattern.source, p + "g"));
                                            for (var h = d.pattern || d, _ = t.next, m = a; _ !== i.tail && !(r && m >= r.reach); m += _.value.length,
                                                _ = _.next) {
                                                var b = _.value;
                                                if (i.length > n.length)
                                                    return;
                                                if (!(b instanceof T)) {
                                                    var k, w = 1;
                                                    if (l) {
                                                        if (!(k = C(h, m, n, s)) || k.index >= n.length)
                                                            break;
                                                        var y = k.index
                                                            , x = k.index + k[0].length
                                                            , S = m;
                                                        for (S += _.value.length; S <= y;)
                                                            _ = _.next,
                                                                S += _.value.length;
                                                        if (S -= _.value.length,
                                                            m = S,
                                                            _.value instanceof T)
                                                            continue;
                                                        for (var A = _; A !== i.tail && (S < x || "string" == typeof A.value); A = A.next)
                                                            w++,
                                                                S += A.value.length;
                                                        w--,
                                                            b = n.slice(m, S),
                                                            k.index -= m
                                                    } else if (!(k = C(h, 0, b, s)))
                                                        continue;
                                                    var y = k.index
                                                        , $ = k[0]
                                                        , z = b.slice(0, y)
                                                        , F = b.slice(y + $.length)
                                                        , E = m + b.length;
                                                    r && E > r.reach && (r.reach = E);
                                                    b = _.prev;
                                                    z && (b = j(i, b, z),
                                                        m += z.length),
                                                        L(i, b, w);
                                                    $ = new T(c, g ? R.tokenize($, g) : $, v, $);
                                                    _ = j(i, b, $),
                                                        F && j(i, _, F),
                                                        1 < w && (E = {
                                                            cause: c + "," + f,
                                                            reach: E
                                                        },
                                                            e(n, i, o, _.prev, m, E),
                                                            r && E.reach > r.reach && (r.reach = E.reach))
                                                }
                                            }
                                        }
                                    }
                            }(e, t, n, t.head, 0),
                            function (e) {
                                var n = []
                                    , i = e.head.next;
                                for (; i !== e.tail;)
                                    n.push(i.value),
                                        i = i.next;
                                return n
                            }(t)
                    },
                    hooks: {
                        all: {},
                        add: function (e, n) {
                            var i = R.hooks.all;
                            i[e] = i[e] || [],
                                i[e].push(n)
                        },
                        run: function (e, n) {
                            var i = R.hooks.all[e];
                            if (i && i.length)
                                for (var o, t = 0; o = i[t++];)
                                    o(n)
                        }
                    },
                    Token: T
                };
            function T(e, n, i, o) {
                this.type = e,
                    this.content = n,
                    this.alias = i,
                    this.length = 0 | (o || "").length
            }
            function C(e, n, i, o) {
                e.lastIndex = n;
                i = e.exec(i);
                return i && o && i[1] && (o = i[1].length,
                    i.index += o,
                    i[0] = i[0].slice(o)),
                    i
            }
            function a() {
                var e = {
                    value: null,
                    prev: null,
                    next: null
                }
                    , n = {
                        value: null,
                        prev: e,
                        next: null
                    };
                e.next = n,
                    this.head = e,
                    this.tail = n,
                    this.length = 0
            }
            function j(e, n, i) {
                var o = n.next
                    , i = {
                        value: i,
                        prev: n,
                        next: o
                    };
                return n.next = i,
                    o.prev = i,
                    e.length++,
                    i
            }
            function L(e, n, i) {
                for (var o = n.next, t = 0; t < i && o !== e.tail; t++)
                    o = o.next;
                (n.next = o).prev = n,
                    e.length -= t
            }
            if (u.Prism = R,
                T.stringify = function n(e, i) {
                    if ("string" == typeof e)
                        return e;
                    if (Array.isArray(e)) {
                        var o = "";
                        return e.forEach(function (e) {
                            o += n(e, i)
                        }),
                            o
                    }
                    var t = {
                        type: e.type,
                        content: n(e.content, i),
                        tag: "span",
                        classes: ["token", e.type],
                        attributes: {},
                        language: i
                    }
                        , e = e.alias;
                    e && (Array.isArray(e) ? Array.prototype.push.apply(t.classes, e) : t.classes.push(e)),
                        R.hooks.run("wrap", t);
                    var a, r = "";
                    for (a in t.attributes)
                        r += " " + a + '="' + (t.attributes[a] || "").replace(/"/g, "&quot;") + '"';
                    return "<" + t.tag + ' class="' + t.classes.join(" ") + '"' + r + ">" + t.content + "</" + t.tag + ">"
                }
                ,
                !u.document)
                return u.addEventListener && (R.disableWorkerMessageHandler || u.addEventListener("message", function (e) {
                    var n = JSON.parse(e.data)
                        , i = n.language
                        , e = n.code
                        , n = n.immediateClose;
                    u.postMessage(R.highlight(e, R.languages[i], i)),
                        n && u.close()
                }, !1)),
                    R;
            var o = R.util.currentScript();
            function t() {
                R.manual || R.highlightAll()
            }
            return o && (R.filename = o.src,
                o.hasAttribute("data-manual") && (R.manual = !0)),
                R.manual || ("loading" === (e = document.readyState) || "interactive" === e && o && o.defer ? document.addEventListener("DOMContentLoaded", t) : window.requestAnimationFrame ? window.requestAnimationFrame(t) : window.setTimeout(t, 16)),
                R
        }("undefined" != typeof window ? window : "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope ? self : {});
        e.exports && (e.exports = g),
            void 0 !== me && (me.Prism = g),
            g.languages.markup = {
                comment: {
                    pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
                    greedy: !0
                },
                prolog: {
                    pattern: /<\?[\s\S]+?\?>/,
                    greedy: !0
                },
                doctype: {
                    pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
                    greedy: !0,
                    inside: {
                        "internal-subset": {
                            pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
                            lookbehind: !0,
                            greedy: !0,
                            inside: null
                        },
                        string: {
                            pattern: /"[^"]*"|'[^']*'/,
                            greedy: !0
                        },
                        punctuation: /^<!|>$|[[\]]/,
                        "doctype-tag": /^DOCTYPE/i,
                        name: /[^\s<>'"]+/
                    }
                },
                cdata: {
                    pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
                    greedy: !0
                },
                tag: {
                    pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
                    greedy: !0,
                    inside: {
                        tag: {
                            pattern: /^<\/?[^\s>\/]+/,
                            inside: {
                                punctuation: /^<\/?/,
                                namespace: /^[^\s>\/:]+:/
                            }
                        },
                        "special-attr": [],
                        "attr-value": {
                            pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
                            inside: {
                                punctuation: [{
                                    pattern: /^=/,
                                    alias: "attr-equals"
                                }, {
                                    pattern: /^(\s*)["']|["']$/,
                                    lookbehind: !0
                                }]
                            }
                        },
                        punctuation: /\/?>/,
                        "attr-name": {
                            pattern: /[^\s>\/]+/,
                            inside: {
                                namespace: /^[^\s>\/:]+:/
                            }
                        }
                    }
                },
                entity: [{
                    pattern: /&[\da-z]{1,8};/i,
                    alias: "named-entity"
                }, /&#x?[\da-f]{1,8};/i]
            },
            g.languages.markup.tag.inside["attr-value"].inside.entity = g.languages.markup.entity,
            g.languages.markup.doctype.inside["internal-subset"].inside = g.languages.markup,
            g.hooks.add("wrap", function (e) {
                "entity" === e.type && (e.attributes.title = e.content.replace(/&amp;/, "&"))
            }),
            Object.defineProperty(g.languages.markup.tag, "addInlined", {
                value: function (e, n) {
                    var i = {};
                    i["language-" + n] = {
                        pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
                        lookbehind: !0,
                        inside: g.languages[n]
                    },
                        i.cdata = /^<!\[CDATA\[|\]\]>$/i;
                    i = {
                        "included-cdata": {
                            pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
                            inside: i
                        }
                    };
                    i["language-" + n] = {
                        pattern: /[\s\S]+/,
                        inside: g.languages[n]
                    };
                    n = {};
                    n[e] = {
                        pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function () {
                            return e
                        }), "i"),
                        lookbehind: !0,
                        greedy: !0,
                        inside: i
                    },
                        g.languages.insertBefore("markup", "cdata", n)
                }
            }),
            Object.defineProperty(g.languages.markup.tag, "addAttribute", {
                value: function (e, n) {
                    g.languages.markup.tag.inside["special-attr"].push({
                        pattern: RegExp(/(^|["'\s])/.source + "(?:" + e + ")" + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source, "i"),
                        lookbehind: !0,
                        inside: {
                            "attr-name": /^[^\s=]+/,
                            "attr-value": {
                                pattern: /=[\s\S]+/,
                                inside: {
                                    value: {
                                        pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
                                        lookbehind: !0,
                                        alias: [n, "language-" + n],
                                        inside: g.languages[n]
                                    },
                                    punctuation: [{
                                        pattern: /^=/,
                                        alias: "attr-equals"
                                    }, /"|'/]
                                }
                            }
                        }
                    })
                }
            }),
            g.languages.html = g.languages.markup,
            g.languages.mathml = g.languages.markup,
            g.languages.svg = g.languages.markup,
            g.languages.xml = g.languages.extend("markup", {}),
            g.languages.ssml = g.languages.xml,
            g.languages.atom = g.languages.xml,
            g.languages.rss = g.languages.xml,
            function (e) {
                var n = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;
                e.languages.css = {
                    comment: /\/\*[\s\S]*?\*\//,
                    atrule: {
                        pattern: RegExp("@[\\w-](?:" + /[^;{\s"']|\s+(?!\s)/.source + "|" + n.source + ")*?" + /(?:;|(?=\s*\{))/.source),
                        inside: {
                            rule: /^@[\w-]+/,
                            "selector-function-argument": {
                                pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
                                lookbehind: !0,
                                alias: "selector"
                            },
                            keyword: {
                                pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
                                lookbehind: !0
                            }
                        }
                    },
                    url: {
                        pattern: RegExp("\\burl\\((?:" + n.source + "|" + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ")\\)", "i"),
                        greedy: !0,
                        inside: {
                            function: /^url/i,
                            punctuation: /^\(|\)$/,
                            string: {
                                pattern: RegExp("^" + n.source + "$"),
                                alias: "url"
                            }
                        }
                    },
                    selector: {
                        pattern: RegExp("(^|[{}\\s])[^{}\\s](?:[^{};\"'\\s]|\\s+(?![\\s{])|" + n.source + ")*(?=\\s*\\{)"),
                        lookbehind: !0
                    },
                    string: {
                        pattern: n,
                        greedy: !0
                    },
                    property: {
                        pattern: /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
                        lookbehind: !0
                    },
                    important: /!important\b/i,
                    function: {
                        pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
                        lookbehind: !0
                    },
                    punctuation: /[(){};:,]/
                },
                    e.languages.css.atrule.inside.rest = e.languages.css;
                e = e.languages.markup;
                e && (e.tag.addInlined("style", "css"),
                    e.tag.addAttribute("style", "css"))
            }(g),
            g.languages.clike = {
                comment: [{
                    pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
                    lookbehind: !0,
                    greedy: !0
                }, {
                    pattern: /(^|[^\\:])\/\/.*/,
                    lookbehind: !0,
                    greedy: !0
                }],
                string: {
                    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
                    greedy: !0
                },
                "class-name": {
                    pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
                    lookbehind: !0,
                    inside: {
                        punctuation: /[.\\]/
                    }
                },
                keyword: /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
                boolean: /\b(?:false|true)\b/,
                function: /\b\w+(?=\()/,
                number: /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
                operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
                punctuation: /[{}[\];(),.:]/
            },
            g.languages.javascript = g.languages.extend("clike", {
                "class-name": [g.languages.clike["class-name"], {
                    pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
                    lookbehind: !0
                }],
                keyword: [{
                    pattern: /((?:^|\})\s*)catch\b/,
                    lookbehind: !0
                }, {
                    pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
                    lookbehind: !0
                }],
                function: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
                number: {
                    pattern: RegExp(/(^|[^\w$])/.source + "(?:" + /NaN|Infinity/.source + "|" + /0[bB][01]+(?:_[01]+)*n?/.source + "|" + /0[oO][0-7]+(?:_[0-7]+)*n?/.source + "|" + /0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source + "|" + /\d+(?:_\d+)*n/.source + "|" + /(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source + ")" + /(?![\w$])/.source),
                    lookbehind: !0
                },
                operator: /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
            }),
            g.languages.javascript["class-name"][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/,
            g.languages.insertBefore("javascript", "keyword", {
                regex: {
                    pattern: RegExp(/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source + /\//.source + "(?:" + /(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source + "|" + /(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source + ")" + /(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source),
                    lookbehind: !0,
                    greedy: !0,
                    inside: {
                        "regex-source": {
                            pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
                            lookbehind: !0,
                            alias: "language-regex",
                            inside: g.languages.regex
                        },
                        "regex-delimiter": /^\/|\/$/,
                        "regex-flags": /^[a-z]+$/
                    }
                },
                "function-variable": {
                    pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
                    alias: "function"
                },
                parameter: [{
                    pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
                    lookbehind: !0,
                    inside: g.languages.javascript
                }, {
                    pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
                    lookbehind: !0,
                    inside: g.languages.javascript
                }, {
                    pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
                    lookbehind: !0,
                    inside: g.languages.javascript
                }, {
                    pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
                    lookbehind: !0,
                    inside: g.languages.javascript
                }],
                constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/
            }),
            g.languages.insertBefore("javascript", "string", {
                hashbang: {
                    pattern: /^#!.*/,
                    greedy: !0,
                    alias: "comment"
                },
                "template-string": {
                    pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
                    greedy: !0,
                    inside: {
                        "template-punctuation": {
                            pattern: /^`|`$/,
                            alias: "string"
                        },
                        interpolation: {
                            pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
                            lookbehind: !0,
                            inside: {
                                "interpolation-punctuation": {
                                    pattern: /^\$\{|\}$/,
                                    alias: "punctuation"
                                },
                                rest: g.languages.javascript
                            }
                        },
                        string: /[\s\S]+/
                    }
                },
                "string-property": {
                    pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
                    lookbehind: !0,
                    greedy: !0,
                    alias: "property"
                }
            }),
            g.languages.insertBefore("javascript", "operator", {
                "literal-property": {
                    pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
                    lookbehind: !0,
                    alias: "property"
                }
            }),
            g.languages.markup && (g.languages.markup.tag.addInlined("script", "javascript"),
                g.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source, "javascript")),
            g.languages.js = g.languages.javascript,
            void 0 !== g && "undefined" != typeof document && (Element.prototype.matches || (Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector),
                u = {
                    js: "javascript",
                    py: "python",
                    rb: "ruby",
                    ps1: "powershell",
                    psm1: "powershell",
                    sh: "bash",
                    bat: "batch",
                    h: "c",
                    tex: "latex"
                },
                d = "pre[data-src]:not([" + (f = "data-src-status") + '="loaded"]):not([' + f + '="' + (p = "loading") + '"])',
                g.hooks.add("before-highlightall", function (e) {
                    e.selector += ", " + d
                }),
                g.hooks.add("before-sanity-check", function (e) {
                    var t, n, i, o, a, r, c = e.element;
                    c.matches(d) && (e.code = "",
                        c.setAttribute(f, p),
                        (t = c.appendChild(document.createElement("CODE"))).textContent = "Loading…",
                        i = c.getAttribute("data-src"),
                        "none" === (e = e.language) && (n = (/\.(\w+)$/.exec(i) || [, "none"])[1],
                            e = u[n] || n),
                        g.util.setLanguage(t, e),
                        g.util.setLanguage(c, e),
                        (n = g.plugins.autoloader) && n.loadLanguages(e),
                        i = i,
                        o = function (e) {
                            c.setAttribute(f, "loaded");
                            var n, i, o = function (e) {
                                if (i = /^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(e || "")) {
                                    var n = Number(i[1])
                                        , e = i[2]
                                        , i = i[3];
                                    return e ? i ? [n, Number(i)] : [n, void 0] : [n, n]
                                }
                            }(c.getAttribute("data-range"));
                            o && (n = e.split(/\r\n?|\n/g),
                                i = o[0],
                                o = null == o[1] ? n.length : o[1],
                                i < 0 && (i += n.length),
                                i = Math.max(0, Math.min(i - 1, n.length)),
                                o < 0 && (o += n.length),
                                o = Math.max(0, Math.min(o, n.length)),
                                e = n.slice(i, o).join("\n"),
                                c.hasAttribute("data-start") || c.setAttribute("data-start", String(i + 1))),
                                t.textContent = e,
                                g.highlightElement(t)
                        }
                        ,
                        a = function (e) {
                            c.setAttribute(f, "failed"),
                                t.textContent = e
                        }
                        ,
                        (r = new XMLHttpRequest).open("GET", i, !0),
                        r.onreadystatechange = function () {
                            4 == r.readyState && (r.status < 400 && r.responseText ? o(r.responseText) : 400 <= r.status ? a("✖ Error " + r.status + " while fetching file: " + r.statusText) : a("✖ Error: File does not exist or is empty"))
                        }
                        ,
                        r.send(null))
                }),
                n = !(g.plugins.fileHighlight = {
                    highlight: function (e) {
                        for (var n, i = (e || document).querySelectorAll(d), o = 0; n = i[o++];)
                            g.highlightElement(n)
                    }
                }),
                g.fileHighlight = function () {
                    n || (console.warn("Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead."),
                        n = !0),
                        g.plugins.fileHighlight.highlight.apply(this, arguments)
                }
            )
    });
    function Mn(e, n) {
        return "___" + e.toUpperCase() + n + "___"
    }
    qn = Prism,
        Object.defineProperties(qn.languages["markup-templating"] = {}, {
            buildPlaceholders: {
                value: function (o, t, e, a) {
                    var r;
                    o.language === t && (r = o.tokenStack = [],
                        o.code = o.code.replace(e, function (e) {
                            if ("function" == typeof a && !a(e))
                                return e;
                            for (var n, i = r.length; -1 !== o.code.indexOf(n = Mn(t, i));)
                                ++i;
                            return r[i] = e,
                                n
                        }),
                        o.grammar = qn.languages.markup)
                }
            },
            tokenizePlaceholders: {
                value: function (f, p) {
                    var d, g;
                    f.language === p && f.tokenStack && (f.grammar = qn.languages[p],
                        d = 0,
                        g = Object.keys(f.tokenStack),
                        function e(n) {
                            for (var i = 0; i < n.length && !(d >= g.length); i++) {
                                var o, t, a, r, c, u = n[i];
                                "string" == typeof u || u.content && "string" == typeof u.content ? (t = g[d],
                                    a = f.tokenStack[t],
                                    o = "string" == typeof u ? u : u.content,
                                    c = Mn(p, t),
                                    -1 < (r = o.indexOf(c)) && (++d,
                                        t = o.substring(0, r),
                                        a = new qn.Token(p, qn.tokenize(a, f.grammar), "language-" + p, a),
                                        r = o.substring(r + c.length),
                                        c = [],
                                        t && c.push.apply(c, e([t])),
                                        c.push(a),
                                        r && c.push.apply(c, e([r])),
                                        "string" == typeof u ? n.splice.apply(n, [i, 1].concat(c)) : u.content = c)) : u.content && e(u.content)
                            }
                            return n
                        }(f.tokens))
                }
            }
        });
    function In(t, e) {
        var a = this;
        this.config = t,
            this.router = e,
            this.cacheTree = {},
            this.toc = [],
            this.cacheTOC = {},
            this.linkTarget = t.externalLinkTarget || "_blank",
            this.linkRel = "_blank" === this.linkTarget ? t.externalLinkRel || "noopener" : "",
            this.contentBase = e.getBasePath();
        var n = this._initRenderer();
        this.heading = n.heading;
        var r = o(e = t.markdown || {}) ? e(Sn, n) : (Sn.setOptions(m(e, {
            renderer: m(n, e.renderer)
        })),
            Sn);
        this._marked = r,
            this.compile = function (i) {
                var o = !0
                    , e = c(function (e) {
                        o = !1;
                        var n = "";
                        return i && (n = f(i) ? r(i) : r.parser(i),
                            n = t.noEmoji ? n : jn(n, t.nativeEmoji),
                            Tn.clear(),
                            n)
                    })(i)
                    , n = a.router.parse().file;
                return o ? a.toc = a.cacheTOC[n] : a.cacheTOC[n] = [].concat(a.toc),
                    e
            }
    }
    var Nn = {}
        , Hn = {
            markdown: function (e) {
                return {
                    url: e
                }
            },
            mermaid: function (e) {
                return {
                    url: e
                }
            },
            iframe: function (e, n) {
                return {
                    html: '<iframe src="' + e + '" ' + (n || "width=100% height=400") + "></iframe>"
                }
            },
            video: function (e, n) {
                return {
                    html: '<video src="' + e + '" ' + (n || "controls") + ">Not Support</video>"
                }
            },
            audio: function (e, n) {
                return {
                    html: '<audio src="' + e + '" ' + (n || "controls") + ">Not Support</audio>"
                }
            },
            code: function (e, n) {
                var i = e.match(/\.(\w+)$/);
                return {
                    url: e,
                    lang: i = "md" === (i = n || i && i[1]) ? "markdown" : i
                }
            }
        };
    In.prototype.compileEmbed = function (e, n) {
        var i, o, t = Ln(n), a = t.str, t = t.config;
        if (n = a,
            t.include)
            return R(e) || (e = q(this.contentBase, C(this.router.getCurrentPath()), e)),
                t.type && (o = Hn[t.type]) ? (i = o.call(this, e, n)).type = t.type : (o = "code",
                    /\.(md|markdown)/.test(e) ? o = "markdown" : /\.mmd/.test(e) ? o = "mermaid" : /\.html?/.test(e) ? o = "iframe" : /\.(mp4|ogg)/.test(e) ? o = "video" : /\.mp3/.test(e) && (o = "audio"),
                    (i = Hn[o].call(this, e, n)).type = o),
                i.fragment = t.fragment,
                i
    }
        ,
        In.prototype._matchNotCompileLink = function (e) {
            for (var n = this.config.noCompileLinks || [], i = 0; i < n.length; i++) {
                var o = n[i];
                if ((Nn[o] || (Nn[o] = new RegExp("^" + o + "$"))).test(e))
                    return e
            }
        }
        ,
        In.prototype._initRenderer = function () {
            var r, c, u, f, p, d, e = new Sn.Renderer, n = this.linkTarget, i = this.linkRel, a = this.router, o = this.contentBase, g = this, t = {};
            return t.heading = e.heading = function (e, n) {
                var i = Ln(e)
                    , o = i.str
                    , t = i.config
                    , e = {
                        level: n,
                        title: On(o)
                    };
                /<!-- {docsify-ignore} -->/g.test(o) && (o = o.replace("\x3c!-- {docsify-ignore} --\x3e", ""),
                    e.title = On(o),
                    e.ignoreSubHeading = !0),
                    /{docsify-ignore}/g.test(o) && (o = o.replace("{docsify-ignore}", ""),
                        e.title = On(o),
                        e.ignoreSubHeading = !0),
                    /<!-- {docsify-ignore-all} -->/g.test(o) && (o = o.replace("\x3c!-- {docsify-ignore-all} --\x3e", ""),
                        e.title = On(o),
                        e.ignoreAllSubs = !0),
                    /{docsify-ignore-all}/g.test(o) && (o = o.replace("{docsify-ignore-all}", ""),
                        e.title = On(o),
                        e.ignoreAllSubs = !0);
                i = Tn(t.id || o),
                    t = a.toURL(a.getCurrentPath(), {
                        id: i
                    });
                return e.slug = t,
                    g.toc.push(e),
                    "<h" + n + ' id="' + i + '"><a href="' + t + '" data-id="' + i + '" class="anchor"><span>' + o + "</span></a></h" + n + ">"
            }
                ,
                t.code = {
                    renderer: e
                }.renderer.code = function (e, n) {
                    var i = Pn.languages[n = void 0 === n ? "markup" : n] || Pn.languages.markup;
                    return '<pre v-pre data-lang="' + n + '"><code class="lang-' + n + '">' + Pn.highlight(e.replace(/@DOCSIFY_QM@/g, "`"), i, n) + "</code></pre>"
                }
                ,
                t.link = (i = (n = {
                    renderer: e,
                    router: a,
                    linkTarget: n,
                    linkRel: i,
                    compilerClass: g
                }).renderer,
                    c = n.router,
                    u = n.linkTarget,
                    n.linkRel,
                    f = n.compilerClass,
                    i.link = function (e, n, i) {
                        var o = []
                            , t = Ln(n = void 0 === n ? "" : n)
                            , a = t.str
                            , t = t.config;
                        return u = t.target || u,
                            r = "_blank" === u ? f.config.externalLinkRel || "noopener" : "",
                            n = a,
                            R(e) || f._matchNotCompileLink(e) || t.ignore ? (R(e) || "./" !== e.slice(0, 2) || (e = document.URL.replace(/\/(?!.*\/).*/, "/").replace("#/./", "") + e),
                                o.push(0 === e.indexOf("mailto:") ? "" : 'target="' + u + '"'),
                                o.push(0 !== e.indexOf("mailto:") && "" !== r ? ' rel="' + r + '"' : "")) : (e === f.config.homepage && (e = "README"),
                                    e = c.toURL(e, null, c.getCurrentPath())),
                            t.disabled && (o.push("disabled"),
                                e = "javascript:void(0)"),
                            t.class && o.push('class="' + t.class + '"'),
                            t.id && o.push('id="' + t.id + '"'),
                            n && o.push('title="' + n + '"'),
                            '<a href="' + e + '" ' + o.join(" ") + ">" + i + "</a>"
                    }
                ),
                t.paragraph = {
                    renderer: e
                }.renderer.paragraph = function (e) {
                    e = /^!&gt;/.test(e) ? $n("tip", e) : /^\?&gt;/.test(e) ? $n("warn", e) : "<p>" + e + "</p>";
                    return e
                }
                ,
                t.image = (o = (i = {
                    renderer: e,
                    contentBase: o,
                    router: a
                }).renderer,
                    p = i.contentBase,
                    d = i.router,
                    o.image = function (e, n, i) {
                        var o = e
                            , t = []
                            , a = Ln(n)
                            , r = a.str
                            , a = a.config;
                        return n = r,
                            a["no-zoom"] && t.push("data-no-zoom"),
                            n && t.push('title="' + n + '"'),
                            a.size && (n = (r = a.size.split("x"))[0],
                                (r = r[1]) ? t.push('width="' + n + '" height="' + r + '"') : t.push('width="' + n + '"')),
                            a.class && t.push('class="' + a.class + '"'),
                            a.id && t.push('id="' + a.id + '"'),
                            R(e) || (o = q(p, C(d.getCurrentPath()), e)),
                            0 < t.length ? '<img src="' + o + '" data-origin="' + e + '" alt="' + i + '" ' + t.join(" ") + " />" : '<img src="' + o + '" data-origin="' + e + '" alt="' + i + '"' + t + ">"
                    }
                ),
                t.list = {
                    renderer: e
                }.renderer.list = function (e, n, i) {
                    n = n ? "ol" : "ul";
                    return "<" + n + " " + [/<li class="task-list-item">/.test(e.split('class="task-list"')[0]) ? 'class="task-list"' : "", i && 1 < i ? 'start="' + i + '"' : ""].join(" ").trim() + ">" + e + "</" + n + ">"
                }
                ,
                t.listitem = {
                    renderer: e
                }.renderer.listitem = function (e) {
                    return /^(<input.*type="checkbox"[^>]*>)/.test(e) ? '<li class="task-list-item"><label>' + e + "</label></li>" : "<li>" + e + "</li>"
                }
                ,
                e.origin = t,
                e
        }
        ,
        In.prototype.sidebar = function (e, n) {
            var i = this.toc
                , o = this.router.getCurrentPath()
                , t = "";
            if (e)
                t = this.compile(e);
            else {
                for (var a = 0; a < i.length; a++)
                    if (i[a].ignoreSubHeading) {
                        var r = i[a].level;
                        i.splice(a, 1);
                        for (var c = a; c < i.length && r < i[c].level; c++)
                            i.splice(c, 1) && c-- && a++;
                        a--
                    }
                n = this.cacheTree[o] || zn(i, n),
                    t = An(n, "<ul>{inner}</ul>");
                this.cacheTree[o] = n
            }
            return t
        }
        ,
        In.prototype.subSidebar = function (e) {
            if (e) {
                var n = this.router.getCurrentPath()
                    , i = this.cacheTree
                    , o = this.toc;
                o[0] && o[0].ignoreAllSubs && o.splice(0),
                    o[0] && 1 === o[0].level && o.shift();
                for (var t = 0; t < o.length; t++)
                    o[t].ignoreSubHeading && o.splice(t, 1) && t--;
                e = i[n] || zn(o, e);
                return i[n] = e,
                    this.toc = [],
                    An(e)
            }
            this.toc = []
        }
        ,
        In.prototype.header = function (e, n) {
            return this.heading(e, n)
        }
        ,
        In.prototype.article = function (e) {
            return this.compile(e)
        }
        ,
        In.prototype.cover = function (e) {
            var n = this.toc.slice()
                , e = this.compile(e);
            return this.toc = n.slice(),
                e
        }
        ;
    function Dn(e) {
        var n = Zn(e);
        return 0 === n ? e : (n = new RegExp("^[ \\t]{" + n + "}", "gm"),
            e.replace(n, ""))
    }
    var Un, Zn = function (e) {
        e = e.match(/^[ \t]*(?=\S)/gm);
        return e ? e.reduce(function (e, n) {
            return Math.min(e, n.length)
        }, 1 / 0) : 0
    }, Bn = {};
    function Vn(e, o) {
        var a = e.compiler
            , t = e.raw;
        void 0 === t && (t = "");
        var n = e.fetch
            , e = Bn[t];
        if (e) {
            var i = e.slice();
            return i.links = e.links,
                o(i)
        }
        var i = a._marked
            , r = i.lexer(t)
            , c = []
            , u = i.Lexer.rules.inline.link
            , f = r.links;
        r.forEach(function (e, t) {
            "paragraph" === e.type && (e.text = e.text.replace(new RegExp(u.source, "g"), function (e, n, i, o) {
                o = a.compileEmbed(i, o);
                return o && c.push({
                    index: t,
                    embed: o
                }),
                    e
            }))
        });
        var p = [];
        !function (e, a) {
            var n, i = e.embedTokens, r = e.compile, c = (e.fetch,
                0), u = 1;
            if (!i.length)
                return a({});
            for (; n = i[c++];) {
                var o = function (t) {
                    return function (e) {
                        var n, i, o;
                        e && ("markdown" === t.embed.type ? ((i = t.embed.url.split("/")).pop(),
                            i = i.join("/"),
                            e = e.replace(/\[([^[\]]+)\]\(([^)]+)\)/g, function (e) {
                                var n = e.indexOf("(");
                                return "(." === e.slice(n, n + 2) ? e.substring(0, n) + "(" + window.location.protocol + "//" + window.location.host + i + "/" + e.substring(n + 1, e.length - 1) + ")" : e
                            }),
                            !0 === (($docsify.frontMatter || {}).installed || !1) && (e = $docsify.frontMatter.parseMarkdown(e)),
                            n = r.lexer(e)) : "code" === t.embed.type ? (t.embed.fragment && (o = t.embed.fragment,
                                o = new RegExp("(?:###|\\/\\/\\/)\\s*\\[" + o + "\\]([\\s\\S]*)(?:###|\\/\\/\\/)\\s*\\[" + o + "\\]"),
                                e = Dn((e.match(o) || [])[1] || "").trim()),
                                n = r.lexer("```" + t.embed.lang + "\n" + e.replace(/`/g, "@DOCSIFY_QM@") + "\n```\n")) : "mermaid" === t.embed.type ? (n = [{
                                    type: "html",
                                    text: '<div class="mermaid">\n' + e + "\n</div>"
                                }]).links = {} : (n = [{
                                    type: "html",
                                    text: e
                                }]).links = {}),
                            a({
                                token: t,
                                embedToken: n
                            }),
                            ++u >= c && a({})
                    }
                }(n);
                n.embed.url ? X(n.embed.url).then(o) : o(n.embed.html)
            }
        }({
            compile: i,
            embedTokens: c,
            fetch: n
        }, function (e) {
            var n, i = e.embedToken, e = e.token;
            e ? (n = e.index,
                p.forEach(function (e) {
                    n > e.start && (n += e.length)
                }),
                m(f, i.links),
                r = r.slice(0, n).concat(i, r.slice(n + 1)),
                p.push({
                    start: n,
                    length: i.length - 1
                })) : (Bn[t] = r.concat(),
                    r.links = Bn[t].links = f,
                    o(r))
        })
    }
    function Yn(e, n, i) {
        var o, t, a, r;
        return n = "function" == typeof i ? i(n) : "string" == typeof i ? (a = [],
            r = 0,
            (o = i).replace(V, function (n, e, i) {
                a.push(o.substring(r, i - 1)),
                    r = i += n.length + 1,
                    a.push(t && t[n] || function (e) {
                        return ("00" + ("string" == typeof Y[n] ? e[Y[n]]() : Y[n](e))).slice(-n.length)
                    }
                    )
            }),
            r !== o.length && a.push(o.substring(r)),
            function (e) {
                for (var n = "", i = 0, o = e || new Date; i < a.length; i++)
                    n += "string" == typeof a[i] ? a[i] : a[i](o);
                return n
            }(new Date(n))) : n,
            e.replace(/{docsify-updated}/g, n)
    }
    function Gn(e) {
        function n(e) {
            var n = Boolean(e.__vue__ && e.__vue__._isVue)
                , e = Boolean(e._vnode && e._vnode.__v_skip);
            return n || e
        }
        var i = this.config
            , o = b(".markdown-section")
            , t = "Vue" in window && window.Vue.version && Number(window.Vue.version.charAt(0));
        if (e = e || "<h1>404 - Not found</h1>",
            "Vue" in window)
            for (var a = 0, r = k(".markdown-section > *").filter(n); a < r.length; a += 1) {
                var c = r[a];
                2 === t ? c.__vue__.$destroy() : 3 === t && c.__vue_app__.unmount()
            }
        if (this._renderTo(o, e),
            i.loadSidebar || this._renderSidebar(),
            (i.executeScript || "Vue" in window && !1 !== i.executeScript) && (!(e = k(".markdown-section>script").filter(function (e) {
                return !/template/.test(e.type)
            })[0]) || (e = e.innerText.trim()) && new Function(e)()),
            "Vue" in window) {
            var u, f, p = [], d = Object.keys(i.vueComponents || {});
            2 === t && d.length && d.forEach(function (e) {
                window.Vue.options.components[e] || window.Vue.component(e, i.vueComponents[e])
            }),
                !Un && i.vueGlobalOptions && "function" == typeof i.vueGlobalOptions.data && (Un = i.vueGlobalOptions.data()),
                p.push.apply(p, Object.keys(i.vueMounts || {}).map(function (e) {
                    return [b(o, e), i.vueMounts[e]]
                }).filter(function (e) {
                    var n = e[0];
                    e[1];
                    return n
                })),
                (i.vueGlobalOptions || d.length) && (u = /{{2}[^{}]*}{2}/,
                    f = /<[^>/]+\s([@:]|v-)[\w-:.[\]]+[=>\s]/,
                    p.push.apply(p, k(".markdown-section > *").filter(function (i) {
                        return !p.some(function (e) {
                            var n = e[0];
                            e[1];
                            return n === i
                        })
                    }).filter(function (e) {
                        return e.tagName.toLowerCase() in (i.vueComponents || {}) || e.querySelector(d.join(",") || null) || u.test(e.outerHTML) || f.test(e.outerHTML)
                    }).map(function (e) {
                        var n = m({}, i.vueGlobalOptions || {});
                        return Un && (n.data = function () {
                            return Un
                        }
                        ),
                            [e, n]
                    })));
            for (var g = 0, s = p; g < s.length; g += 1) {
                var l, v = s[g], h = v[0], _ = v[1], v = "data-isvue";
                h.matches("pre, script") || n(h) || h.querySelector("[" + v + "]") || (h.setAttribute(v, ""),
                    2 === t ? (_.el = void 0,
                        new window.Vue(_).$mount(h)) : 3 === t && (l = window.Vue.createApp(_),
                            d.forEach(function (e) {
                                var n = i.vueComponents[e];
                                l.component(e, n)
                            }),
                            l.mount(h)))
            }
        }
    }
    function Wn(n, i, o, t, a, e) {
        n = e ? n : n.replace(/\/$/, ""),
            (n = C(n)) && X(a.router.getFile(n + o) + i, !1, a.config.requestHeaders).then(t, function (e) {
                return Wn(n, i, o, t, a)
            })
    }
    function Xn() {
        var n = function () {
            return null
        };
        return [function (e) {
            n(e)
        }
            , function (e) {
                n = e
            }
        ]
    }
    Me = Object.freeze({
        __proto__: null,
        cached: c,
        hyphenate: a,
        hasOwn: u,
        merge: m,
        isPrimitive: f,
        noop: d,
        isFn: o,
        isExternal: g,
        inBrowser: !0,
        isMobile: s,
        supportsPushState: t,
        parseQuery: F,
        stringifyQuery: E,
        isAbsolutePath: R,
        removeParams: T,
        getParentPath: C,
        cleanPath: j,
        resolvePath: L,
        getPath: q,
        replaceSlug: P
    });
    var Qn, Jn = function (e) {
        function n() {
            e.call(this),
                this.config = ue(this),
                this.initLifecycle(),
                this.initPlugin(),
                this.callHook("init"),
                this.initRouter(),
                this.initRender(),
                this.initEvent(),
                this.initFetch(),
                this.callHook("mounted")
        }
        return e && (n.__proto__ = e),
            ((n.prototype = Object.create(e && e.prototype)).constructor = n).prototype.initPlugin = function () {
                var n = this;
                [].concat(this.config.plugins).forEach(function (e) {
                    try {
                        o(e) && e(n._lifecycle, n)
                    } catch (e) {
                        if (!n.config.catchPluginErrors)
                            throw e;
                        console.error("Docsify plugin error", e)
                    }
                })
            }
            ,
            n
    }((we = Object,
        function (e) {
            function n() {
                e.apply(this, arguments)
            }
            return e && (n.__proto__ = e),
                ((n.prototype = Object.create(e && e.prototype)).constructor = n).prototype._loadSideAndNav = function (e, n, i, o) {
                    var t = this;
                    return function () {
                        if (!i)
                            return o();
                        Wn(e, n, i, function (e) {
                            t._renderSidebar(e),
                                o()
                        }, t, !0)
                    }
                }
                ,
                n.prototype._fetch = function (i) {
                    var o = this;
                    void 0 === i && (i = d);
                    var t, e, n, a, r, c, u, f = this.route.query, p = this.route.path;
                    g(p) ? (history.replaceState(null, "", "#"),
                        this.router.normalize()) : (t = E(f, ["id"]),
                            f = (e = this.config).loadNavbar,
                            n = e.requestHeaders,
                            a = e.loadSidebar,
                            r = this.router.getFile(p),
                            this.isRemoteUrl = g(r),
                            this.isHTML = /\.html$/g.test(r),
                            c = function (e, n) {
                                o._renderMain(e, n, o._loadSideAndNav(p, t, a, i))
                            }
                            ,
                            u = function (e) {
                                o._fetchFallbackPage(p, t, i) || o._fetch404(r, t, i)
                            }
                            ,
                            this.isRemoteUrl ? Kn(r + t, 0, n).then(c, u) : this.matchVirtualRoute(p).then(function (e) {
                                "string" == typeof e ? c(e) : Kn(r + t, 0, n).then(c, u)
                            }),
                            f && Wn(p, t, f, function (e) {
                                return o._renderNav(e)
                            }, this, !0))
                }
                ,
                n.prototype._fetchCover = function () {
                    var n = this
                        , e = this.config
                        , i = e.coverpage
                        , o = e.requestHeaders
                        , t = this.route.query
                        , a = C(this.route.path);
                    if (i) {
                        var r = null
                            , e = this.route.path;
                        "string" == typeof i ? "/" === e && (r = i) : r = Array.isArray(i) ? -1 < i.indexOf(e) && "_coverpage" : !0 === (e = i[e]) ? "_coverpage" : e;
                        var c = Boolean(r) && this.config.onlyCover;
                        return r ? (r = this.router.getFile(a + r),
                            this.coverIsHTML = /\.html$/g.test(r),
                            X(r + E(t, ["id"]), !1, o).then(function (e) {
                                return n._renderCover(e, c)
                            })) : this._renderCover(null, c),
                            c
                    }
                }
                ,
                n.prototype.$fetch = function (e, n) {
                    var i = this;
                    void 0 === e && (e = d),
                        void 0 === n && (n = this.$resetEvents.bind(this));
                    function o() {
                        i.callHook("doneEach"),
                            e()
                    }
                    this._fetchCover() ? o() : this._fetch(function () {
                        n(),
                            o()
                    })
                }
                ,
                n.prototype._fetchFallbackPage = function (i, o, t) {
                    var a = this;
                    void 0 === t && (t = d);
                    var e = this.config
                        , n = e.requestHeaders
                        , r = e.fallbackLanguages
                        , c = e.loadSidebar;
                    if (!r)
                        return !1;
                    e = i.split("/")[1];
                    if (-1 === r.indexOf(e))
                        return !1;
                    e = this.router.getFile(i.replace(new RegExp("^/" + e), ""));
                    return Kn(e + o, 0, n).then(function (e, n) {
                        return a._renderMain(e, n, a._loadSideAndNav(i, o, c, t))
                    }, function () {
                        return a._fetch404(i, o, t)
                    }),
                        !0
                }
                ,
                n.prototype._fetch404 = function (e, n, i) {
                    var o = this
                        , t = this.config
                        , a = t.loadSidebar
                        , r = t.requestHeaders
                        , t = t.notFoundPage
                        , c = this._loadSideAndNav(e, n, a, i = void 0 === i ? d : i);
                    if (t) {
                        e = function (n, e) {
                            var i, o, t = e.notFoundPage, a = "_404" + (e.ext || ".md");
                            switch (typeof t) {
                                case "boolean":
                                    o = a;
                                    break;
                                case "string":
                                    o = t;
                                    break;
                                case "object":
                                    o = (i = Object.keys(t).sort(function (e, n) {
                                        return n.length - e.length
                                    }).filter(function (e) {
                                        return n.match(new RegExp("^" + e))
                                    })[0]) && t[i] || a
                            }
                            return o
                        }(e, this.config);
                        return Kn(this.router.getFile(e), 0, r).then(function (e, n) {
                            return o._renderMain(e, n, c)
                        }, function () {
                            return o._renderMain(null, {}, c)
                        }),
                            !0
                    }
                    return this._renderMain(null, {}, c),
                        !1
                }
                ,
                n.prototype.initFetch = function () {
                    var e, n = this, i = this.config.loadSidebar;
                    this.rendered ? (e = ee(this.router, ".sidebar-nav", !0, !0),
                        i && e && (e.parentNode.innerHTML += window.__SUB_SIDEBAR__),
                        this._bindEventOnRendered(e),
                        this.$resetEvents(),
                        this.callHook("doneEach"),
                        this.callHook("ready")) : this.$fetch(function (e) {
                            return n.callHook("ready")
                        })
                }
                ,
                n
        }(function (e) {
            function n() {
                e.apply(this, arguments)
            }
            return e && (n.__proto__ = e),
                ((n.prototype = Object.create(e && e.prototype)).constructor = n).prototype.$resetEvents = function (e) {
                    var n = this
                        , i = this.config.auto2top;
                    "history" !== e && (n.route.query.id && he(n.route.path, n.route.query.id),
                        "navigate" === e && i && (i = i,
                            _e.scrollTop = !0 === (i = void 0 === i ? 0 : i) ? 0 : Number(i))),
                        this.config.loadNavbar && ee(this.router, "nav")
                }
                ,
                n.prototype.initEvent = function () {
                    function n(e) {
                        return h.classList.toggle("close")
                    }
                    var e;
                    e = "button.sidebar-toggle",
                        this.router,
                        null != (e = l(e)) && (p(e, "click", function (e) {
                            e.stopPropagation(),
                                n()
                        }),
                            s && p(h, "click", function (e) {
                                return h.classList.contains("close") && n()
                            })),
                        e = ".sidebar",
                        this.router,
                        null != (e = l(e)) && p(e, "click", function (e) {
                            e = e.target;
                            "A" === e.nodeName && e.nextSibling && e.nextSibling.classList && e.nextSibling.classList.contains("app-sub-sidebar") && S(e.parentNode, "collapse")
                        }),
                        this.config.coverpage ? s || p("scroll", K) : h.classList.add("sticky")
                }
                ,
                n
        }(function (e) {
            function n() {
                e.apply(this, arguments)
            }
            return e && (n.__proto__ = e),
                ((n.prototype = Object.create(e && e.prototype)).constructor = n).prototype._renderTo = function (e, n, i) {
                    e = l(e);
                    e && (e[i ? "outerHTML" : "innerHTML"] = n)
                }
                ,
                n.prototype._renderSidebar = function (e) {
                    var n = this.config
                        , i = n.maxLevel
                        , o = n.subMaxLevel
                        , t = n.loadSidebar;
                    if (n.hideSidebar)
                        return [document.querySelector("aside.sidebar"), document.querySelector("button.sidebar-toggle")].filter(function (e) {
                            return !!e
                        }).forEach(function (e) {
                            return e.parentNode.removeChild(e)
                        }),
                            document.querySelector("section.content").style.right = "unset",
                            document.querySelector("section.content").style.left = "unset",
                            document.querySelector("section.content").style.position = "relative",
                            document.querySelector("section.content").style.width = "100%",
                            null;
                    this._renderTo(".sidebar-nav", this.compiler.sidebar(e, i));
                    i = ee(this.router, ".sidebar-nav", !0, !0);
                    t && i ? i.parentNode.innerHTML += this.compiler.subSidebar(o) || "" : this.compiler.subSidebar(),
                        this._bindEventOnRendered(i)
                }
                ,
                n.prototype._bindEventOnRendered = function (e) {
                    var n, i = this.config.autoHeader;
                    !function (e) {
                        var n = b(".cover.show");
                        se = n ? n.offsetHeight : 0;
                        for (var i, n = l(".sidebar"), o = [], t = 0, a = (o = null != n ? k(n, "li") : o).length; t < a; t += 1) {
                            var r, c, u = o[t], f = u.querySelector("a");
                            f && ("/" !== (r = f.getAttribute("href")) && (f = (c = e.parse(r)).query.id,
                                c = c.path,
                                f && (r = ve(c, f))),
                                r && (fe[decodeURIComponent(r)] = u))
                        }
                        s || (i = T(e.getCurrentPath()),
                            x("scroll", function () {
                                return le(i)
                            }),
                            p("scroll", function () {
                                return le(i)
                            }),
                            p(n, "mouseover", function () {
                                pe = !0
                            }),
                            p(n, "mouseleave", function () {
                                pe = !1
                            }))
                    }(this.router),
                        i && e && ((i = (n = l("#main")).children[0]) && "H1" !== i.tagName && y(n, w("div", this.compiler.header(e.innerText, 1)).children[0]))
                }
                ,
                n.prototype._renderNav = function (e) {
                    e && this._renderTo("nav", this.compiler.compile(e)),
                        this.config.loadNavbar && ee(this.router, "nav")
                }
                ,
                n.prototype._renderMain = function (o, t, a) {
                    var r = this;
                    if (void 0 === t && (t = {}),
                        !o)
                        return Gn.call(this, o);
                    this.callHook("beforeEach", o, function (e) {
                        function n() {
                            t.updatedAt && (i = Yn(i, t.updatedAt, r.config.formatUpdated)),
                                r.callHook("afterEach", i, function (e) {
                                    Gn.call(r, e),
                                        a()
                                })
                        }
                        var i;
                        r.isHTML ? (i = r.result = o,
                            n()) : Vn({
                                compiler: r.compiler,
                                raw: e
                            }, function (e) {
                                i = r.compiler.compile(e),
                                    n()
                            })
                    })
                }
                ,
                n.prototype._renderCover = function (e, n) {
                    var i, o = l(".cover");
                    S(l("main"), n ? "add" : "remove", "hidden"),
                        e ? (S(o, "add", "show"),
                            (n = (i = this.coverIsHTML ? e : this.compiler.cover(e)).trim().match('<p><img.*?data-origin="(.*?)"[^a]+alt="(.*?)">([^<]*?)</p>$')) && ("color" === n[2] ? o.style.background = n[1] + (n[3] || "") : (e = n[1],
                                S(o, "add", "has-mask"),
                                R(n[1]) || (e = q(this.router.getBasePath(), n[1])),
                                o.style.backgroundImage = "url(" + e + ")",
                                o.style.backgroundSize = "cover",
                                o.style.backgroundPosition = "center center"),
                                i = i.replace(n[0], "")),
                            this._renderTo(".cover-main", i),
                            K()) : S(o, "remove", "show")
                }
                ,
                n.prototype._updateRender = function () {
                    var e, n, i, o;
                    e = this,
                        n = l(".app-name-link"),
                        i = e.config.nameLink,
                        o = e.route.path,
                        n && (f(e.config.nameLink) ? n.setAttribute("href", i) : "object" == typeof i && (e = Object.keys(i).filter(function (e) {
                            return -1 < o.indexOf(e)
                        })[0],
                            n.setAttribute("href", i[e])))
                }
                ,
                n.prototype.initRender = function () {
                    var e = this.config;
                    this.compiler = new In(e, this.router),
                        window.__current_docsify_compiler__ = this.compiler;
                    var n, i, o, t, a, r = e.el || "#app", c = b("nav") || w("nav"), u = b(r), f = "", p = h;
                    u ? (e.repo && (f += (t = e.repo,
                        r = e.cornerExternalLinkTarget,
                        t ? '<a href="' + (t = (t = !/\/\//.test(t) ? "https://github.com/" + t : t).replace(/^git\+/, "")) + '" target="' + (r = r || "_blank") + '" class="github-corner" aria-label="View source on Github"><svg viewBox="0 0 250 250" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg></a>' : "")),
                        e.coverpage && (f += (o = ", 100%, 85%",
                            '<section class="cover show" style="background: ' + ("linear-gradient(to left bottom, hsl(" + Math.floor(255 * Math.random()) + o + ") 0%,hsl(" + Math.floor(255 * Math.random()) + o + ") 100%)") + '"><div class="mask"></div><div class="cover-main">\x3c!--cover--\x3e</div></section>')),
                        e.logo && (o = /^data:image/.test(e.logo),
                            n = /(?:http[s]?:)?\/\//.test(e.logo),
                            i = /^\./.test(e.logo),
                            o || n || i || (e.logo = q(this.router.getBasePath(), e.logo))),
                        f += (i = (n = e).name || "",
                            "<main>" + ('<button class="sidebar-toggle" aria-label="Menu"><div class="sidebar-toggle-button"><span></span><span></span><span></span></div></button><aside class="sidebar">' + (n.name ? '<h1 class="app-name"><a class="app-name-link" data-nosearch>' + (n.logo ? '<img alt="' + i + '" src=' + n.logo + ">" : i) + "</a></h1>" : "") + '<div class="sidebar-nav">\x3c!--sidebar--\x3e</div></aside>') + '<section class="content"><article class="markdown-section" id="main">\x3c!--main--\x3e</article></section></main>'),
                        this._renderTo(u, f, !0)) : this.rendered = !0,
                        e.mergeNavbar && s ? p = b(".sidebar") : (c.classList.add("app-nav"),
                            e.repo || c.classList.add("no-badge")),
                        e.loadNavbar && y(p, c),
                        e.themeColor && (v.head.appendChild(w("div", "<style>:root{--theme-color: " + e.themeColor + ";}</style>").firstElementChild),
                            a = e.themeColor,
                            window.CSS && window.CSS.supports && window.CSS.supports("(--v:red)") || (e = k("style:not(.inserted),link"),
                                [].forEach.call(e, function (e) {
                                    "STYLE" === e.nodeName ? Q(e, a) : "LINK" === e.nodeName && (e = e.getAttribute("href"),
                                        /\.css$/.test(e) && X(e).then(function (e) {
                                            e = w("style", e);
                                            _.appendChild(e),
                                                Q(e, a)
                                        }))
                                }))),
                        this._updateRender(),
                        S(h, "ready")
                }
                ,
                n
        }(function (e) {
            function n() {
                e.apply(this, arguments)
            }
            return e && (n.__proto__ = e),
                ((n.prototype = Object.create(e && e.prototype)).constructor = n).prototype.routes = function () {
                    return this.config.routes || {}
                }
                ,
                n.prototype.matchVirtualRoute = function (t) {
                    var a = this.routes()
                        , r = Object.keys(a)
                        , c = function () {
                            return null
                        };
                    function u() {
                        var e = r.shift();
                        if (!e)
                            return c(null);
                        var n = A(o = (i = "^",
                            0 === (o = e).indexOf(i) ? o : "^" + o), "$") ? o : o + "$"
                            , i = t.match(n);
                        if (!i)
                            return u();
                        var o = a[e];
                        if ("string" == typeof o)
                            return c(o);
                        if ("function" != typeof o)
                            return u();
                        n = o,
                            e = Xn(),
                            o = e[0];
                        return (0,
                            e[1])(function (e) {
                                return "string" == typeof e ? c(e) : !1 === e ? c(null) : u()
                            }),
                            n.length <= 2 ? o(n(t, i)) : n(t, i, o)
                    }
                    return {
                        then: function (e) {
                            c = e,
                                u()
                        }
                    }
                }
                ,
                n
        }(function (i) {
            function e() {
                for (var e = [], n = arguments.length; n--;)
                    e[n] = arguments[n];
                i.apply(this, e),
                    this.route = {}
            }
            return i && (e.__proto__ = i),
                ((e.prototype = Object.create(i && i.prototype)).constructor = e).prototype.updateRender = function () {
                    this.router.normalize(),
                        this.route = this.router.parse(),
                        h.setAttribute("data-page", this.route.file)
                }
                ,
                e.prototype.initRouter = function () {
                    var n = this
                        , e = this.config
                        , e = new ("history" === (e.routerMode || "hash") && t ? D : H)(e);
                    this.router = e,
                        this.updateRender(),
                        U = this.route,
                        e.onchange(function (e) {
                            n.updateRender(),
                                n._updateRender(),
                                U.path !== n.route.path ? (n.$fetch(d, n.$resetEvents.bind(n, e.source)),
                                    U = n.route) : n.$resetEvents(e.source)
                        })
                }
                ,
                e
        }(function (e) {
            function n() {
                e.apply(this, arguments)
            }
            return e && (n.__proto__ = e),
                ((n.prototype = Object.create(e && e.prototype)).constructor = n).prototype.initLifecycle = function () {
                    var i = this;
                    this._hooks = {},
                        this._lifecycle = {},
                        ["init", "mounted", "beforeEach", "afterEach", "doneEach", "ready"].forEach(function (e) {
                            var n = i._hooks[e] = [];
                            i._lifecycle[e] = function (e) {
                                return n.push(e)
                            }
                        })
                }
                ,
                n.prototype.callHook = function (e, t, a) {
                    void 0 === a && (a = d);
                    var r = this._hooks[e]
                        , c = this.config.catchPluginErrors
                        , u = function (n) {
                            var e = r[n];
                            if (n >= r.length)
                                a(t);
                            else if ("function" == typeof e) {
                                var i = "Docsify plugin error";
                                if (2 === e.length)
                                    try {
                                        e(t, function (e) {
                                            t = e,
                                                u(n + 1)
                                        })
                                    } catch (e) {
                                        if (!c)
                                            throw e;
                                        console.error(i, e),
                                            u(n + 1)
                                    }
                                else
                                    try {
                                        var o = e(t);
                                        t = void 0 === o ? t : o,
                                            u(n + 1)
                                    } catch (e) {
                                        if (!c)
                                            throw e;
                                        console.error(i, e),
                                            u(n + 1)
                                    }
                            } else
                                u(n + 1)
                        };
                    u(0)
                }
                ,
                n
        }(we))))))));
    function Kn(e, n, i) {
        return Qn && Qn.abort && Qn.abort(),
            Qn = X(e, !0, i)
    }
    window.Docsify = {
        util: Me,
        dom: n,
        get: X,
        slugify: Tn,
        version: "4.13.1"
    },
        window.DocsifyCompiler = In,
        window.marked = Sn,
        window.Prism = Pn,
        e(function (e) {
            return new Jn
        })
}();
