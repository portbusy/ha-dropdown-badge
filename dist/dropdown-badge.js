var w=Object.defineProperty;var x=(n,e)=>()=>(n&&(e=n(n=0)),e);var y=(n,e)=>{for(var t in e)w(n,t,{get:e[t],enumerable:!0})};var m={};y(m,{default:()=>L});var T,k,h,L,g=x(()=>{T=`
  :host {
    display: block;
  }
  .editor {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`,k={entity:"Entity",name:"Name",icon:"Icon",color:"Color",show_name:"Show name",show_state:"Show state",dropdown_on:"Open dropdown on",tap_action:"Tap action",hold_action:"Hold action",double_tap_action:"Double tap action"},h=class extends HTMLElement{constructor(){super(),this._config={},this._hass=void 0,this._lovelace=void 0,this._form=void 0,this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`<style>${T}</style><div class="editor"></div>`}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}set lovelace(e){this._lovelace=e}get lovelace(){return this._lovelace}setConfig(e){this._config={...e},this._render()}_dispatchChange(e){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_valueChanged(e){let t={...this._config,...e.detail.value};this._dispatchChange(t)}_computeSchema(){return[{name:"entity",required:!0,selector:{entity:{domain:["select","input_select"]}}},{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}},{name:"color",selector:{ui_color:{}}},{name:"show_name",selector:{boolean:{}}},{name:"show_state",selector:{boolean:{}}},{name:"dropdown_on",selector:{select:{mode:"list",options:[{label:"Tap",value:"tap"},{label:"Hold",value:"hold"},{label:"Double tap",value:"double_tap"}]}}},{name:"tap_action",selector:{ui_action:{}}},{name:"hold_action",selector:{ui_action:{}}},{name:"double_tap_action",selector:{ui_action:{}}}]}_ensureEditor(){if(this._form)return;let e=this.shadowRoot.querySelector(".editor"),t=document.createElement("ha-form");this._form=t,t.hass=this._hass,t.data=this._config,t.schema=this._computeSchema(),t.computeLabel=o=>k[o.name]||o.name,t.addEventListener("value-changed",this._valueChanged.bind(this)),e.appendChild(t)}_render(){this._ensureEditor(),this._form.hass=this._hass,this._form.data=this._config}};customElements.define("dropdown-badge-editor",h);L=h});function _(n,e){if(!n||!e)return[];let t=e.entity;if(!t)return[];let o=n.states?.[t];if(!o)return[];let i=t.split(".")[0];return(i==="select"||i==="input_select")&&Array.isArray(o.attributes?.options)?o.attributes.options.map(a=>typeof a=="object"&&a!==null?{label:String(a.label??a.value),value:String(a.value),icon:a.icon}:{label:String(a),value:String(a)}):[]}function E(n){return n.split(".")[0]}function b(n,e,t){let o=E(t);return o==="select"||o==="input_select"?{domain:o,service:"select_option",data:{option:e,entity_id:t}}:null}var S=`
  :host {
    display: inline-flex;
    position: relative;
    vertical-align: middle;
    --badge-color: var(--secondary-text-color);
  }
  .badge {
    height: var(--ha-badge-size, 36px);
    min-width: var(--ha-badge-size, 36px);
    border-radius: var(--ha-badge-border-radius, calc(var(--ha-badge-size, 36px) / 2));
    padding: 0 12px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: var(--ha-card-background, var(--card-background-color, white));
    backdrop-filter: var(--ha-card-backdrop-filter, none);
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
    box-shadow: var(--ha-card-box-shadow, none);
    color: var(--badge-color);
    font-family: var(--paper-font-body1_-_font-family, inherit);
    cursor: pointer;
    user-select: none;
    transition: box-shadow 0.2s ease;
    outline: none;
    position: relative;
    overflow: hidden;
  }
  .badge::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: var(--badge-color);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }
  .badge:hover::before {
    opacity: 0.04;
  }
  .badge:active::before,
  .badge.pressed::before {
    opacity: 0.12;
  }
  .badge:focus-visible {
    border-color: var(--badge-color);
    box-shadow: 0 0 0 1px var(--badge-color);
  }
  .badge.error {
    --badge-color: var(--error-color, var(--red-color, #db4437));
  }
  .text {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    line-height: 1.2;
  }
  .label {
    font-size: var(--ha-font-size-xs, 10px);
    font-weight: 500;
    line-height: 10px;
    color: var(--secondary-text-color);
  }
  .content {
    font-size: var(--ha-badge-font-size, var(--ha-font-size-s, 14px));
    font-weight: 500;
    color: var(--primary-text-color);
  }
  ha-icon,
  ha-state-icon {
    position: relative;
    z-index: 1;
    color: var(--badge-color);
    --mdc-icon-size: var(--ha-badge-icon-size, 18px);
    width: var(--ha-badge-icon-size, 18px);
    height: var(--ha-badge-icon-size, 18px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .arrow {
    color: var(--secondary-text-color);
    --mdc-icon-size: 16px;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  .menu {
    position: fixed;
    z-index: 1000;
    min-width: 160px;
    max-width: 280px;
    max-height: 300px;
    overflow-y: auto;
    background: var(--ha-card-background, var(--card-background-color, white));
    color: var(--primary-text-color);
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: var(--ha-card-box-shadow, var(--shadow-elevation-8dp, 0 4px 12px rgba(0,0,0,0.2)));
    padding: 4px 0;
    display: flex;
    flex-direction: column;
  }
  .option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    outline: none;
  }
  .option:focus-visible,
  .option:hover {
    background: var(--secondary-background-color, rgba(127,127,127,0.2));
  }
`;function s(n){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function C(n){return!["off","unavailable","unknown"].includes(n)}var l=class extends HTMLElement{constructor(){super(),this._config=void 0,this._hass=void 0,this._open=!1,this._holdTimer=void 0,this._tapTimer=void 0,this._lastTap=0,this._suppressClick=!1,this._menu=void 0,this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`<style>${S}</style><div class="badge"></div>`,this._boundClick=this._handleClick.bind(this),this._boundClose=this._closeOnOutside.bind(this),this._boundKey=this._handleKey.bind(this),this._boundPointerDown=this._handlePointerDown.bind(this),this._boundPointerUp=this._handlePointerUp.bind(this),this._boundPointerLeave=this._handlePointerLeave.bind(this),this._boundReposition=this._repositionMenu.bind(this)}connectedCallback(){let e=this.shadowRoot.querySelector(".badge");e.addEventListener("click",this._boundClick),e.addEventListener("pointerdown",this._boundPointerDown),e.addEventListener("pointerup",this._boundPointerUp),e.addEventListener("pointerleave",this._boundPointerLeave),document.addEventListener("click",this._boundClose),document.addEventListener("scroll",this._boundReposition,!0),window.addEventListener("resize",this._boundReposition),this.addEventListener("keydown",this._boundKey)}disconnectedCallback(){let e=this.shadowRoot.querySelector(".badge");e.removeEventListener("click",this._boundClick),e.removeEventListener("pointerdown",this._boundPointerDown),e.removeEventListener("pointerup",this._boundPointerUp),e.removeEventListener("pointerleave",this._boundPointerLeave),document.removeEventListener("click",this._boundClose),document.removeEventListener("scroll",this._boundReposition,!0),window.removeEventListener("resize",this._boundReposition),this.removeEventListener("keydown",this._boundKey),this._clearHoldTimer(),this._clearTapTimer()}static async getConfigElement(){return await Promise.resolve().then(()=>(g(),m)),document.createElement("dropdown-badge-editor")}static getStubConfig(e,t){return{entity:t?.find(i=>i.startsWith("select.")||i.startsWith("input_select."))||"",show_state:!0,show_name:!1,dropdown_on:"tap"}}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}setConfig(e){if(!e||!e.entity)throw new Error("Entity is required");this._config={show_state:!0,show_name:!1,dropdown_on:"tap",...e},this._render()}_formatState(e){return this._hass?.formatEntityState?this._hass.formatEntityState(e):e.state}_formatName(e){return this._config?.name?this._config.name:this._hass?.formatEntityName?this._hass.formatEntityName(e):e.attributes?.friendly_name||e.entity_id}_computeColor(){let e=this._hass?.states?.[this._config?.entity];if(!e)return"";let t=this._config?.color,o=C(e.state);return t?o?t.startsWith("#")||t.startsWith("rgb")||t.startsWith("var(")?s(t):`var(--${s(t)}-color, var(--state-${s(t)}-color, ${s(t)}))`:"":o?"var(--primary-color)":"var(--state-inactive-color)"}_dropdownOn(){let e=this._config;return e&&(e.dropdown_on==="hold"||e.dropdown_on==="double_tap")?e.dropdown_on:"tap"}_hasAction(e){let t=this._config;if(!t)return!1;let o=t[`${e}_action`];return o&&typeof o=="object"&&Object.keys(o).length>0}_dispatchAction(e){if(!this._config)return;let t=this._config[`${e}_action`];if(!this._hasAction(e))if(e==="tap"&&this._dropdownOn()!=="tap")t={action:"more-info"};else return;let o={config:{entity:this._config.entity,tap_action:t&&e==="tap"?t:this._config.tap_action,hold_action:t&&e==="hold"?t:this._config.hold_action,double_tap_action:t&&e==="double_tap"?t:this._config.double_tap_action},action:e};this.dispatchEvent(new CustomEvent("hass-action",{bubbles:!0,composed:!0,detail:o}))}_openMenu(){this._open=!0,this._renderMenu(),this._open&&this.shadowRoot.querySelector(".option")?.focus()}_closeMenu(){this._open=!1,this._renderMenu()}_toggleMenu(){this._open=!this._open,this._renderMenu(),this._open&&this.shadowRoot.querySelector(".option")?.focus()}_handleClick(e){if(e?.stopPropagation(),this._suppressClick){this._suppressClick=!1;return}if(this._dropdownOn()==="double_tap"||this._hasAction("double_tap")){this._handleDoubleTapDetection();return}if(this._dropdownOn()==="tap"){this._toggleMenu();return}this._dispatchAction("tap")}_handleDoubleTapDetection(){let e=Date.now();if(e-this._lastTap<250){this._clearTapTimer(),this._lastTap=0,this._dropdownOn()==="double_tap"?this._openMenu():this._hasAction("double_tap")&&this._dispatchAction("double_tap");return}this._lastTap=e,this._clearTapTimer(),this._tapTimer=window.setTimeout(()=>{this._tapTimer=void 0,this._lastTap=0,this._dropdownOn()==="tap"?this._toggleMenu():this._dispatchAction("tap")},250)}_handlePointerDown(e){if(e.button!==0)return;let t=this.shadowRoot.querySelector(".badge");t.classList.add("pressed"),this._clearHoldTimer(),this._holdTimer=window.setTimeout(()=>{this._holdTimer=void 0,t.classList.remove("pressed"),this._suppressClick=!0,this._dropdownOn()==="hold"?this._openMenu():this._hasAction("hold")&&this._dispatchAction("hold")},500)}_handlePointerUp(){this._clearHoldTimer(),this.shadowRoot.querySelector(".badge").classList.remove("pressed")}_handlePointerLeave(){this._clearHoldTimer(),this.shadowRoot.querySelector(".badge").classList.remove("pressed")}_clearHoldTimer(){this._holdTimer!==void 0&&(clearTimeout(this._holdTimer),this._holdTimer=void 0)}_clearTapTimer(){this._tapTimer!==void 0&&(clearTimeout(this._tapTimer),this._tapTimer=void 0)}_closeOnOutside(e){if(!this._open)return;(e.composedPath?e.composedPath():[e.target]).includes(this)||this._closeMenu()}_handleKey(e){if(e.key==="Escape"){this._closeMenu();return}if(e.key==="Enter"||e.key===" "){e.preventDefault(),this._handleClick();return}if(!this._open)return;let t=Array.from(this.shadowRoot.querySelectorAll(".option")),o=t.indexOf(this.shadowRoot.activeElement);e.key==="ArrowDown"?(e.preventDefault(),t[(o+1)%t.length]?.focus()):e.key==="ArrowUp"&&(e.preventDefault(),t[(o-1+t.length)%t.length]?.focus())}_select(e){if(this._closeMenu(),!this._hass||!this._config)return;let t=b(this._config,e,this._config.entity);t&&this._hass.callService(t.domain,t.service,t.data)}_render(){if(!this.shadowRoot)return;let e=this.shadowRoot.querySelector(".badge");if(!this._config||!this._hass){e.className="badge error",e.innerHTML='<ha-icon icon="mdi:alert-circle"></ha-icon><span>Unavailable</span>',this._renderMenu();return}let t=this._hass.states?.[this._config.entity];if(!t){e.className="badge error",e.innerHTML='<ha-icon icon="mdi:alert-circle"></ha-icon><span>Entity not found</span>',this._renderMenu();return}e.className="badge";let o=this._computeColor();o?e.style.setProperty("--badge-color",o):e.style.removeProperty("--badge-color"),e.setAttribute("tabindex","0"),e.setAttribute("role","button"),e.setAttribute("aria-haspopup","listbox"),e.setAttribute("aria-expanded",String(this._open));let i=this._config.show_name,a=this._config.show_state,r=i?this._formatName(t):"",d=a?this._formatState(t):"",f=this._config.icon?this._config.icon:t.attributes?.icon,u;f?u=`<ha-icon icon="${s(f)}"></ha-icon>`:u="<ha-state-icon></ha-state-icon>";let c="";i&&a&&r&&d?c=`<span class="text"><span class="label">${s(r)}</span><span class="content">${s(d)}</span></span>`:r?c=`<span class="text"><span class="content">${s(r)}</span></span>`:d&&(c=`<span class="text"><span class="content">${s(d)}</span></span>`);let v=_(this._hass,this._config).length?'<ha-icon icon="mdi:chevron-down" class="arrow"></ha-icon>':"";e.innerHTML=`${u}${c}${v}`;let p=e.querySelector("ha-state-icon");p&&(p.hass=this._hass,p.stateObj=t),this._renderMenu()}_renderMenu(){if(this._menu&&(this._menu.remove(),this._menu=void 0),!this._open||!this._config||!this._hass)return;let e=_(this._hass,this._config);if(!e.length)return;let t=document.createElement("div");t.className="menu",t.setAttribute("role","listbox"),t.addEventListener("click",o=>o.stopPropagation());for(let o of e){let i=document.createElement("button");i.className="option",i.setAttribute("role","option"),i.setAttribute("tabindex","-1"),i.dataset.value=o.value,i.innerHTML=o.icon?`<ha-icon icon="${s(o.icon)}"></ha-icon><span>${s(o.label)}</span>`:`<span>${s(o.label)}</span>`,i.addEventListener("click",()=>this._select(o.value)),t.appendChild(i)}this.shadowRoot.appendChild(t),this._menu=t,this._repositionMenu()}_repositionMenu(){if(!this._menu||!this._open)return;let t=this.shadowRoot.querySelector(".badge").getBoundingClientRect();this._menu.style.left=`${t.left}px`,this._menu.style.top=`${t.bottom+4}px`,this._menu.style.minWidth=`${t.width}px`}};customElements.define("dropdown-badge",l);window.customBadges=window.customBadges||[];window.customBadges.push({type:"dropdown-badge",name:"Dropdown Badge",description:"A badge that displays an entity state and opens a dropdown menu on tap.",preview:!0,documentationURL:"https://github.com/portbusy/ha-dropdown-badge"});var $=l;export{S as BADGE_STYLE,$ as default};
