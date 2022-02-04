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
      )
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

export default Util;
