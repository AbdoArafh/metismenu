import $ from 'jquery';

const Util = (($) => { // eslint-disable-line no-shadow
  const TRANSITION_END = 'transitionend';

  const Util = { // eslint-disable-line no-shadow
    TRANSITION_END: 'mmTransitionEnd',

    EVENT_PREFIX: "mm-",

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
        )
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
      if (!elements.length) {
        return;
      }
      if (newHeight) {
        if (typeof newHeight !== "string") {
          elements.forEach(
            element => element.style.height = newHeight + "px"
          )
        } else {
          elements.forEach(
            element => element.style.height = newHeight
          )
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
