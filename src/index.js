import Util from './util';

const NAME = 'metisMenu';
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

export default class MetisMenu {
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
