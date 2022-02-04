/*!
* metismenu https://github.com/onokumus/metismenu#readme
* A collapsible jQuery menu plugin
* @version 3.0.7
* @author Osman Nuri Okumus <onokumus@gmail.com> (https://github.com/onokumus)
* @license: MIT 
*/
import $ from 'jquery';

const Util = (($) => { // eslint-disable-line no-shadow
  const TRANSITION_END = 'transitionend';

  const Util = { // eslint-disable-line no-shadow
    TRANSITION_END: 'mmTransitionEnd',

    triggerTransitionEnd(element) {
      $(element).trigger(TRANSITION_END);
    },

    supportsTransitionEnd() {
      return Boolean(TRANSITION_END);
    },

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
      // check if this is the wanted element
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
      Array.from(elements).forEach(element => {
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

      if (!(elements instanceof Array))
        elements = Array.from(elements);

      return this.flattenArray(
        Array.from(elements).map(element => element.children)
        )
        .filter(el => this.isMatching(el, tagName, id, className));
    },

    find(elements, query="*") {
      return this.flattenArray(
        Array.from(elements).map(element => (
          Array.from(element.querySelectorAll(query))
        ))
      );
    },

    hasClass(elements, className) {
      // todo make it work with multiple classes
      return elements.some(el => el.classList.contains(className));
    },

    addClass(elements, classNames) {
      Array.from(elements).forEach(el => {
        const classes = classNames.split(" ");
        classes.forEach(c => el.classList.add(c));
      });
    },

    removeClass(elements, className) {
      // todo make it work with multiple classes
      Array.from(elements).forEach(el => el.classList.remove(className));
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
      elements.forEach(el => el.setAttribute(key, value));
    },

    has(elements, query) {
      return Array.from(elements)
        .filter(
          element => (
            element.querySelectorAll(query).length > 0
          )
        )
    },

    onEvent(elements, event, func, once) {
      elements = this.handleNonArrays(elements);
      elements.forEach(element =>
        element.addEventListener(event, func, {once})
      );
    },

    on(elements, event, func) {
      this.onEvent(elements, event, func, false);
    },

    one(elements, event, func) {
      this.onEvent(elements, event, func, true);
    }
  };

  function getSpecialTransitionEndEvent() {
    return {
      bindType: TRANSITION_END,
      delegateType: TRANSITION_END,
      handle(event) {
        if ($(event.target).is(this)) {
          return event
            .handleObj
            .handler
            .apply(this, arguments); // eslint-disable-line prefer-rest-params
        }
        return undefined;
      },
    };
  }

  function transitionEndEmulator(duration) {
    let called = false;

    $(this).one(Util.TRANSITION_END, () => {
      called = true;
    });

    setTimeout(() => {
      if (!called) {
        Util.triggerTransitionEnd(this);
      }
    }, duration);

    return this;
  }

  function setTransitionEndSupport() {
    $.fn.mmEmulateTransitionEnd = transitionEndEmulator; // eslint-disable-line no-param-reassign
    // eslint-disable-next-line no-param-reassign
    $.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
  }

  setTransitionEndSupport();

  return Util;
})($);

const NAME = 'metisMenu';
const DATA_KEY = 'metisMenu';
const EVENT_KEY = `.${DATA_KEY}`;
const DATA_API_KEY = '.data-api';
const JQUERY_NO_CONFLICT = $.fn[NAME];
const TRANSITION_DURATION = 350;

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
    const el = $(this.element);

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

    // el.find(`${conf.parentTrigger}.${ClassName.ACTIVE}`)
    //   .children(conf.triggerElement)
    //   .attr('aria-expanded', 'true'); // add attribute aria-expanded=true the trigger element
    
    
    Util.addClass(
      Util.parents(
        ActiveEl,
        "li"
      ),
      ClassName.ACTIVE
    );

    // *TODO* (proposal) el.prototype = Object.assign(el.prototype || {}, Util);
    // *TODO* (proposal) HTMLElement.prototype = Object.assign(HTMLElement.prototype, Util);
        
    // el.find(`${conf.parentTrigger}.${ClassName.ACTIVE}`)
    //   .parents(conf.parentTrigger)
    //   .addClass(ClassName.ACTIVE);

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

    // el.find(`${conf.parentTrigger}.${ClassName.ACTIVE}`)
    //   .parents(conf.parentTrigger)
    //   .children(conf.triggerElement)
    //   .attr('aria-expanded', 'true'); // add attribute aria-expanded=true the triggers of all parents

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

    // el.find(`${conf.parentTrigger}.${ClassName.ACTIVE}`)
    //   .has(conf.subMenu)
    //   .children(conf.subMenu)
    //   .addClass(`${ClassName.COLLAPSE} ${ClassName.SHOW}`);

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

    // el
    //   .find(conf.parentTrigger)
    //   .not(`.${ClassName.ACTIVE}`)
    //   .has(conf.subMenu)
    //   .children(conf.subMenu)
    //   .addClass(ClassName.COLLAPSE);

    // Util.on(
    //   Util.children(
    //     Util.find(
    //       el,
    //       conf.parentTrigger
    //     ),
    //     conf.triggerElement
    //   ),
    //   Event.CLICK_DATA_API,
    //   function (e) {

    //   }
    // );

    el
      .find(conf.parentTrigger)
      // .has(conf.subMenu)
      .children(conf.triggerElement)
      .on(Event.CLICK_DATA_API, function (e) { // eslint-disable-line func-names
        const eTar = $(this);

        if (eTar.attr('aria-disabled') === 'true') {
          return;
        }

        if (conf.preventDefault && eTar.attr('href') === '#') {
          e.preventDefault();
        }

        const paRent = eTar.parent(conf.parentTrigger);
        const sibLi = paRent.siblings(conf.parentTrigger);
        const sibTrigger = sibLi.children(conf.triggerElement);

        if (paRent.hasClass(ClassName.ACTIVE)) {
          eTar.attr('aria-expanded', 'false');
          self.removeActive(paRent);
        } else {
          eTar.attr('aria-expanded', 'true');
          self.setActive(paRent);
          if (conf.toggle) {
            self.removeActive(sibLi);
            sibTrigger.attr('aria-expanded', 'false');
          }
        }

        if (conf.onTransitionStart) {
          conf.onTransitionStart(e);
        }
      });
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
    if (this.transitioning || $(element).hasClass(ClassName.COLLAPSING)) {
      return;
    }
    const elem = $(element);

    const startEvent = $.Event(Event.SHOW);
    elem.trigger(startEvent);

    if (startEvent.isDefaultPrevented()) {
      return;
    }

    elem.parent(this.config.parentTrigger).addClass(ClassName.ACTIVE);

    if (this.config.toggle) {
      const toggleElem = elem.parent(this.config.parentTrigger).siblings().children(`${this.config.subMenu}.${ClassName.SHOW}`);
      this.hide(toggleElem);
    }

    elem
      .removeClass(ClassName.COLLAPSE)
      .addClass(ClassName.COLLAPSING)
      .height(0);

    this.setTransitioning(true);

    const complete = () => {
      // check if disposed
      if (!this.config || !this.element) {
        return;
      }
      elem
        .removeClass(ClassName.COLLAPSING)
        .addClass(`${ClassName.COLLAPSE} ${ClassName.SHOW}`)
        .height('');

      this.setTransitioning(false);

      elem.trigger(Event.SHOWN);
    };

    elem
      .height(element[0].scrollHeight)
      .one(Util.TRANSITION_END, complete)
      .mmEmulateTransitionEnd(TRANSITION_DURATION);
  }

  hide(element) {
    if (
      this.transitioning || !$(element).hasClass(ClassName.SHOW)
    ) {
      return;
    }

    const elem = $(element);

    const startEvent = $.Event(Event.HIDE);
    elem.trigger(startEvent);

    if (startEvent.isDefaultPrevented()) {
      return;
    }

    elem.parent(this.config.parentTrigger).removeClass(ClassName.ACTIVE);
    // eslint-disable-next-line no-unused-expressions
    elem.height(elem.height())[0].offsetHeight;

    elem
      .addClass(ClassName.COLLAPSING)
      .removeClass(ClassName.COLLAPSE)
      .removeClass(ClassName.SHOW);

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
      elem.trigger(Event.HIDDEN);

      elem
        .removeClass(ClassName.COLLAPSING)
        .addClass(ClassName.COLLAPSE);
    };

    if (elem.height() === 0 || elem.css('display') === 'none') {
      complete();
    } else {
      elem
        .height(0)
        .one(Util.TRANSITION_END, complete)
        .mmEmulateTransitionEnd(TRANSITION_DURATION);
    }
  }

  setTransitioning(isTransitioning) {
    this.transitioning = isTransitioning;
  }

  dispose() {
    $.removeData(this.element, DATA_KEY);

    $(this.element)
      .find(this.config.parentTrigger)
      // .has(this.config.subMenu)
      .children(this.config.triggerElement)
      .off(Event.CLICK_DATA_API);

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
/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = MetisMenu.jQueryInterface; // eslint-disable-line no-param-reassign
$.fn[NAME].Constructor = MetisMenu; // eslint-disable-line no-param-reassign
$.fn[NAME].noConflict = () => {
  // eslint-disable-line no-param-reassign
  $.fn[NAME] = JQUERY_NO_CONFLICT; // eslint-disable-line no-param-reassign
  return MetisMenu.jQueryInterface;
};

export { MetisMenu as default };
//# sourceMappingURL=metisMenu.esm.js.map
