/*!
* metismenu https://github.com/onokumus/metismenu#readme
* A collapsible jQuery menu plugin
* @version 3.0.7
* @author Osman Nuri Okumus <onokumus@gmail.com> (https://github.com/onokumus)
* @license: MIT 
*/
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  const Util = { // eslint-disable-line no-shadow
    TRANSITION_END: 'mmTransitionEnd',

    EVENT_PREFIX: "mm-",

    
    triggerTransitionEnd(element) {
      $(element).trigger(TRANSITION_END);
    },
    
    supportsTransitionEnd() {
      return Boolean(TRANSITION_END);
    },
    
    // todo for later

    // emulateTransitionEnd(duration) {
    //   let called = false;

    //   $(this).one(Util.TRANSITION_END, () => {
    //     called = true;
    //   });

    //   setTimeout(() => {
    //     if (!called) {
    //       Util.triggerTransitionEnd(this);
    //     }
    //   }, duration);

    //   return this;
    // },

    compareStrings(a, b) {
      if (a === undefined) return false;
      return a.toLowerCase() === b.toLowerCase();
    },

    flattenArray(arr) {
      const flatArray = [];
      arr = Array.from(arr);
      for (let i = 0; i < arr.length; i++) {
        flatArray.push(...Array.from(arr[i]));
      }
      return flatArray;
    },

    handleNonArrays(elements) {
      if (!(elements instanceof Array)) {
        if (elements.length)
          return Array.from(elements);
        else
          return [elements]
      }
      return elements
    },

    matcher(query) {
      const matcher = /(\*|\w+)?(?:#(\w+))*(?:\.([A-Za-z\-]+))*/;
      const matches = matcher.exec(query);
      return matches;
    },

    isMatching(el, tagName, id, className) {
      // TODO find another solution
      // let isMatching = this.compareStrings(el.tagName, tagName);
      let isMatching;
      if (tagName && tagName !== "*")
        isMatching = this.compareStrings(el.tagName, tagName);
      else
        isMatching = true;
      if (id && isMatching)
        isMatching = el.id === id;
      if (className && isMatching)
        isMatching = el.classList.contains(className);
      return isMatching;
    },

    isMatchingCriteria(element, criteria) {
      if (criteria instanceof HTMLElement) {
        return element === criteria;
      }
      if (typeof criteria === "string") {
        const [, tagName, id, className] = this.matcher(criteria);
        return this.isMatching(element, tagName, id, className);
      }
      return false;
    },

    parent(elements, criteria) {
      elements = this.handleNonArrays(elements);

      if (!criteria) {
        return elements.map(element => element.parentElement)
      }

      return elements.map(
        element => {
          if (this.isMatchingCriteria(element.parentElement, criteria))
            return element.parentElement
        }
      ).filter(el => el);
    },

    parents(elements, tagName) {
      const parentNodes = [];
      elements = this.handleNonArrays(elements);
      elements.forEach(element => {
        for (let current = element; current.parentElement; current = current.parentElement) {
          parentNodes.push(current.parentElement);
        }
      });
      return parentNodes.filter((el) => this.compareStrings(el.tagName, tagName));
    },

    siblings(elements, criteria) {
      elements = this.handleNonArrays(elements);
      
      if (!criteria) {
        return this.flattenArray(
          elements.map(
            element => Array.from(element.parentElement.children).filter(el => el !== element)
          )
        );
      }

      return this.flattenArray(
        elements.map(
          element => Array
            .from(element.parentElement.children)
            .filter(el => el !== element)
            .filter(el => this.isMatchingCriteria(el, criteria))
        )
      );
    },

    children(elements, query) {
      // matches the query to capture tagName
      // and other properties from it
      
      const [, tagName, id, className] = this.matcher(query);

      elements = this.handleNonArrays(elements);

      return this.flattenArray(
        Array.from(elements).map(element => element.children)
        )
        .filter(el => this.isMatching(el, tagName, id, className));
    },

    find(elements, query="*") {
      elements = this.handleNonArrays(elements);
      return this.flattenArray(
        Array.from(elements).map(element => (
          Array.from(element.querySelectorAll(query))
        ))
      );
    },

    hasClass(elements, classNames) {
      elements = this.handleNonArrays(elements);
      classNames = classNames.split(" ");
      return elements.some(
        el =>
          classNames.every(
            className =>
              el.classList.contains(className)
          )
      );
    },

    addClass(elements, classNames) {
      elements = this.handleNonArrays(elements);
      elements.forEach(el => {
        const classes = classNames.split(" ");
        classes.forEach(c => el.classList.add(c));
      });
    },

    removeClass(elements, classNames) {
      classNames = classNames.split(" ");
      elements = this.handleNonArrays(elements);
      elements.forEach(el => {
        classNames.forEach(
          className => el.classList.remove(className)
        );
      });
    },

    not(elements, criteria) {
      elements = this.handleNonArrays(elements);
      if (criteria instanceof HTMLElement) {
        return elements.filter(el => el !== criteria);
      }
      if (typeof criteria === "string") {
        const [, tagName, id, className] = this.matcher(criteria);
        return elements.filter(
          el => !this.isMatching(el, tagName, id, className)
        );
      }
      return [];
    },

    attr(elements, key, value) {
      elements = this.handleNonArrays(elements);
      if (!value) return elements[0].getAttribute(key);
      elements.forEach(el => el.setAttribute(key, value));
    },

    has(elements, query) {
      elements = this.handleNonArrays(elements);
      return elements.filter(
          element => (
            element.querySelectorAll(query).length > 0
          )
        )
    },

    onEvent(elements, event, handler, once) {
      elements = this.handleNonArrays(elements);
      const eventType = event.split(".")[0];
      elements.forEach(element =>
        {
          element.addEventListener(eventType, handler, {once});
          // attaches the event handler to the element so it can be refrenced later
          element[this.EVENT_PREFIX + event] = handler;
        }
      );
    },

    on(elements, event, handler) {
      this.onEvent(elements, event, handler, false);
    },

    one(elements, event, handler) {
      this.onEvent(elements, event, handler, true);
    },

    off(elements, event) {
      elements = this.handleNonArrays(elements);
      const eventType = event.split(".")[0];
      // removing the event listener with the custom Event Handler
      elements.forEach(
        element => {
          element.removeEventListener(eventType, element[this.EVENT_PREFIX + event]);
          delete element[this.EVENT_PREFIX + event];
        }
      );
    },

    trigger(elements, event, data) {
      elements = this.handleNonArrays(elements);
      elements.forEach(
        element => {
          if (element[this.EVENT_PREFIX + event])
            element[this.EVENT_PREFIX + event]({target: element, data});
        }
      );
    },

    data(elements, dataKey, dataValue) {
      elements = this.handleNonArrays(elements);
      // if a value not given for data it
      if (!dataKey) {
        return elements.map(
          element => element.dataset
        );
      }

      if (!dataValue) {
        return elements.map(
          element => element.dataset[dataKey]
        );
      }

      elements.forEach(
        element => element.dataset[dataKey] = dataValue
      );
    },

    removeData(elements, dataKey) {
      elements = this.handleNonArrays(elements);
      if (!dataKey) {
        elements.map(element => 
          Object.keys(element.dataset).map(
            key => delete element.dataset[key]
          ).every(el => el)
        ).every(el => el);
        return true;
      }
      return elements.map(
        element => delete element.dataset[dataKey]
      ).every(el => el);
    },

    height(elements, newHeight) {
      /**
       * When this method is used to return height, it returns the height of the FIRST matched element.
       * When this method is used to set height, it sets the height of ALL matched elements.
       */
      elements = this.handleNonArrays(elements);
      if (!elements[0]) {
        return;
      }
      if (newHeight) {
        if (typeof newHeight !== "string") {
          elements.forEach(
            element => element.style.height = newHeight + "px"
          );
        } else {
          elements.forEach(
            element => element.style.height = newHeight
          );
        }
        return this.height(elements);
      }
      // return height as a number
      return Number(window.getComputedStyle(elements[0]).height.match(/\d+/)[0]);
    },
    
    css(elements, rule, value) {
      elements = this.handleNonArrays(elements);
      if (!elements.length) throw Error("No elements were given");
      if (!value) {
        return window.getComputedStyle(elements[0])[rule];
      }
      elements.forEach(
        element => element.style[rule] = value
      );
      return elements;
    }
  };

  const DATA_KEY = 'metisMenu';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  // const TRANSITION_DURATION = 350;

  const Default = {
    toggle: true,
    preventDefault: true,
    triggerElement: 'a',
    parentTrigger: 'li',
    subMenu: 'ul',
  };

  const Event = {
    SHOW: `show${EVENT_KEY}`,
    SHOWN: `shown${EVENT_KEY}`,
    HIDE: `hide${EVENT_KEY}`,
    HIDDEN: `hidden${EVENT_KEY}`,
    CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`,
    // added this as an alternative to mmTransitionEnd
    TRANSITION_END: `transitionend${EVENT_KEY}`,
  };

  const ClassName = {
    METIS: 'metismenu',
    ACTIVE: 'mm-active',
    SHOW: 'mm-show',
    COLLAPSE: 'mm-collapse',
    COLLAPSING: 'mm-collapsing',
    COLLAPSED: 'mm-collapsed',
  };

  class MetisMenu {
    // eslint-disable-line no-shadow
    constructor(element, config) {
      this.element = element;
      this.config = {
        ...Default,
        ...config,
      };
      this.transitioning = null;

      this.init();
    }

    init() {
      const self = this;
      const conf = this.config;
      const el = this.element;

      Util.addClass(el, ClassName.METIS);

      const ActiveEl = Util.find(
        el,
        `${conf.parentTrigger}.${ClassName.ACTIVE}`
      );

      Util.attr(
        Util.find(
          ActiveEl,
          conf.triggerElement
        ),
        'aria-expanded',
        'true'
      );
      
      Util.addClass(
        Util.parents(
          ActiveEl,
          "li"
        ),
        ClassName.ACTIVE
      );

      Util.attr(
        Util.children(
          Util.parents(
            ActiveEl,
            conf.parentTrigger
          ),
          conf.triggerElement
        ),
        "aria-expanded",
        "true"
      );

      Util.addClass(
        Util.children(
          Util.has(
            ActiveEl,
            conf.subMenu
          ),
          conf.subMenu
        ),
        `${ClassName.COLLAPSE} ${ClassName.SHOW}`
      );

      Util.addClass(
        Util.children(
          Util.not(
            Util.find(
              el,
              conf.parentTrigger
            ),
            `.${ClassName.ACTIVE}`
          ),
          conf.subMenu
        ),
        ClassName.COLLAPSE
      );

      Util.on(
        Util.children(
          Util.find(
            el,
            conf.parentTrigger
          ),
          conf.triggerElement
        ),
        Event.CLICK_DATA_API,
        function (e) {
          // eTar is eventTarget
          const eTar = e.target;

          if (Util.attr(eTar, 'aria-disabled') === 'true') {
            return;
          }

          if (conf.preventDefault && Util.attr(eTar, 'href') === '#') {
            e.preventDefault();
          }

          const paRent = Util.parent(eTar, conf.parentTrigger);
          const sibLi = Util.siblings(paRent, conf.parentTrigger);
          const sibTrigger = Util.children(sibLi, conf.triggerElement);

          if (Util.hasClass(paRent, ClassName.ACTIVE)) {
            Util.attr(eTar, 'aria-expanded', 'false');
            self.removeActive(paRent);
          } else {
            Util.attr(eTar, 'aria-expanded', 'true');
            self.setActive(paRent);
            if (conf.toggle) {
              self.removeActive(sibLi);
              Util.attr(sibTrigger, 'aria-expanded', 'false');
            }
          }

          if (conf.onTransitionStart) {
            conf.onTransitionStart(e);
          }
        }
      );
    }

    setActive(li) {
      Util.addClass(li, ClassName.ACTIVE);
      const ul = Util.children(li, this.config.subMenu);
      if (ul.length > 0 && !Util.hasClass(ul, ClassName.SHOW)) {
        this.show(ul);
      }
    }

    removeActive(li) {
      Util.removeClass(li, ClassName.ACTIVE);
      const ul = Util.children(li, `${this.config.subMenu}.${ClassName.SHOW}`);
      if (ul.length > 0) {
        this.hide(ul);
      }
    }

    show(element) {
      if (this.transitioning || Util.hasClass(element, ClassName.COLLAPSING)) {
        return;
      }
      const elem = element;

      // todo
      // const startEvent = $.Event(Event.SHOW);
      // elem.trigger(startEvent);

      // if (startEvent.isDefaultPrevented()) {
      //   return;
      // }

      Util.addClass(
        Util.parent(
          elem,
          this.config.parentTrigger
        ),
        ClassName.ACTIVE
      );

      // todo
      if (this.config.toggle) {
        const toggleElem = Util.children(
          Util.siblings(
            Util.parent(
              elem,
              this.config.parentTrigger
            )
          ),
          `${this.config.subMenu}.${ClassName.SHOW}`
        );
        if (toggleElem.length > 0)
          this.hide(toggleElem);
      }

      Util.removeClass(elem, ClassName.COLLAPSE);
      Util.addClass(elem, ClassName.COLLAPSING);
      Util.height(elem, 0);

      this.setTransitioning(true);

      const complete = () => {
        // check if disposed
        if (!this.config || !this.element) {
          return;
        }

        Util.removeClass(elem, ClassName.COLLAPSING);
        Util.addClass(elem, `${ClassName.COLLAPSE} ${ClassName.SHOW}`);
        Util.height(elem, "");

        this.setTransitioning(false);

        // todo
        // elem.trigger(Event.SHOWN);
      };

      Array.from(elem).forEach(el => el.style.height = elem[0].scrollHeight + "px");
      Util.one(elem, Event.TRANSITION_END, complete);
      
      // todo for later
      // elem.mmEmulateTransitionEnd(TRANSITION_DURATION);
    }

    hide(element) {
      if (
        this.transitioning ||!Util.hasClass(element, ClassName.SHOW)
        // this.transitioning || !$(element).hasClass(ClassName.SHOW)
      ) {
        return;
      }

      const elem =element;

      // todo
      // const startEvent = $.Event(Event.HIDE);
      // elem.trigger(startEvent);

      // if (startEvent.isDefaultPrevented()) {
      //   return;
      // }

      Util.removeClass(
        Util.parent(
          element,
          this.config.parentTrigger
        ),
        ClassName.ACTIVE
      );

      // eslint-disable-next-line no-unused-expressions
      // todo what the hell is this
      // elem.height(elem.height())[0].offsetHeight;

      Util.removeClass(element, ClassName.SHOW);
      Util.removeClass(element, ClassName.COLLAPSE);
      Util.addClass(element, ClassName.COLLAPSING);

      this.setTransitioning(true);

      const complete = () => {
        // check if disposed
        if (!this.config || !this.element) {
          return;
        }

        if (this.transitioning && this.config.onTransitionEnd) {
          this.config.onTransitionEnd();
        }

        this.setTransitioning(false);
        // todo for later
        // elem.trigger(Event.HIDDEN);

        Util.removeClass(elem, ClassName.COLLAPSING);
        Util.addClass(elem, ClassName.COLLAPSE);
      };

      if (Util.height(elem) === 0 || Util.css(elem, "display") === 'none') {
        complete();
      } else {

        // todo rewrite the height method
        Util.one(elem, Event.TRANSITION_END, complete);
        Array.from(elem).forEach(el => el.style.height = "0px");
        
        // todo for later
        // elem.mmEmulateTransitionEnd(TRANSITION_DURATION);
      }
    }

    setTransitioning(isTransitioning) {
      this.transitioning = isTransitioning;
    }

    dispose() {
      Util.removeData(this.element, DATA_KEY);

      Util.off(
        Util.children(
          Util.find(
            this.element,
            this.config.parentTrigger
          ),
          this.config.triggerElement
        ),
        Event.CLICK_DATA_API
      );

      this.transitioning = null;
      this.config = null;
      this.element = null;
    }

    static jQueryInterface(config) {
      // eslint-disable-next-line func-names
      return this.each(function () {
        const $this = $(this);
        let data = $this.data(DATA_KEY);
        const conf = {
          ...Default,
          ...$this.data(),
          ...(typeof config === 'object' && config ? config : {}),
        };

        if (!data) {
          data = new MetisMenu(this, conf);
          $this.data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error(`No method named "${config}"`);
          }
          data[config]();
        }
      });
    }
  }

  window.MetisMenu = MetisMenu;

}));
//# sourceMappingURL=metisMenu.js.map
