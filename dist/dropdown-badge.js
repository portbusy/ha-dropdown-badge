var y=Object.defineProperty;var v=(i,e)=>()=>(i&&(e=i(i=0)),e);var x=(i,e)=>{for(var t in e)y(i,t,{get:e[t],enumerable:!0})};var _={};x(_,{default:()=>E});var S,l,E,m=v(()=>{S=`
  :host {
    display: block;
  }
  .editor {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  label {
    font-weight: 500;
  }
  textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid var(--divider-color, #ccc);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #000);
    font-family: monospace;
    font-size: 13px;
  }
  .hint {
    font-size: 12px;
    opacity: 0.7;
  }
`,l=class extends HTMLElement{constructor(){super(),this._config={},this._hass=void 0,this._lovelace=void 0,this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`<style>${S}</style><div class="editor"></div>`}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}set lovelace(e){this._lovelace=e}get lovelace(){return this._lovelace}setConfig(e){this._config={...e},this._render()}_dispatchChange(e){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_valueChanged(e){let t={...this._config,...e.detail.value};this._dispatchChange(t)}_optionsChanged(e){try{let t=e.target.value?JSON.parse(e.target.value):void 0;this._dispatchChange({...this._config,options:t}),e.target.style.borderColor=""}catch{e.target.style.borderColor="var(--error-color, red)"}}_actionChanged(e){try{let t=e.target.value?JSON.parse(e.target.value):void 0;this._dispatchChange({...this._config,action:t}),e.target.style.borderColor=""}catch{e.target.style.borderColor="var(--error-color, red)"}}_render(){let e=this.shadowRoot.querySelector(".editor");e.innerHTML="";let t=document.createElement("ha-form");t.hass=this._hass,t.data=this._config,t.schema=[{name:"entity",required:!0,selector:{entity:{}}},{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}}},{name:"color",selector:{text:{}}},{name:"show_name",selector:{boolean:{}}},{name:"show_state",selector:{boolean:{}}}],t.computeLabel=c=>c.name.replace(/_/g," ").replace(/^\w/,f=>f.toUpperCase()),t.addEventListener("value-changed",this._valueChanged.bind(this)),e.appendChild(t);let o=document.createElement("div");o.className="field",o.innerHTML=`
      <label>Static options (JSON)</label>
      <textarea rows="4" placeholder='[{"label":"On","value":"on","icon":"mdi:lightbulb"}]'></textarea>
      <span class="hint">Used when the entity has no options attribute.</span>
    `;let n=o.querySelector("textarea");n.value=this._config.options?JSON.stringify(this._config.options,null,2):"",n.addEventListener("change",this._optionsChanged.bind(this)),e.appendChild(o);let s=document.createElement("div");s.className="field",s.innerHTML=`
      <label>Custom action (JSON)</label>
      <textarea rows="4" placeholder='{"service":"light.turn_on","data":{"brightness":"{{value}}"}}'></textarea>
      <span class="hint">Use {{value}} as placeholder for the selected option.</span>
    `;let a=s.querySelector("textarea");a.value=this._config.action?JSON.stringify(this._config.action,null,2):"",a.addEventListener("change",this._actionChanged.bind(this)),e.appendChild(s)}};customElements.define("dropdown-badge-editor",l);E=l});function p(i,e){if(!i||!e)return[];let t=e.entity;if(!t)return[];let o=i.states?.[t];if(o){let n=t.split(".")[0];if((n==="select"||n==="input_select")&&Array.isArray(o.attributes?.options))return o.attributes.options.map(s=>typeof s=="object"&&s!==null?{label:String(s.label??s.value),value:String(s.value),icon:s.icon}:{label:String(s),value:String(s)})}return Array.isArray(e.options)?e.options.map(n=>typeof n=="object"&&n!==null?{label:String(n.label??n.value),value:String(n.value),icon:n.icon}:{label:String(n),value:String(n)}):[]}function u(i,e){if(typeof i=="string")return i.replace(/\{\{value\}\}/g,e);if(Array.isArray(i))return i.map(t=>u(t,e));if(i!==null&&typeof i=="object"){let t={};for(let[o,n]of Object.entries(i))t[o]=u(n,e);return t}return i}function w(i){return i.split(".")[0]}function g(i,e,t){let o=w(t);if(o==="select"||o==="input_select")return{domain:o,service:"select_option",data:{option:e,entity_id:t}};if(i.action?.service){let[n,s]=String(i.action.service).split(".",2);if(!n||!s)return null;let a=u(i.action.data??{},e);return!a.entity_id&&!a.target&&(a.entity_id=t),{domain:n,service:s,data:a}}return null}var C=`
  :host {
    display: inline-flex;
    position: relative;
    vertical-align: middle;
  }
  .badge {
    height: 36px;
    min-width: 36px;
    border-radius: 18px;
    padding: 0 12px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: var(--badge-color, var(--state-inactive-color, #a0a0a0));
    color: var(--text-badge-color, var(--primary-text-color, #fff));
    font-family: var(--paper-font-body1_-_font-family, inherit);
    font-size: 14px;
    cursor: pointer;
    user-select: none;
    transition: box-shadow 0.2s ease;
    outline: none;
  }
  .badge:focus-visible {
    box-shadow: 0 0 0 2px var(--badge-color), 0 0 0 4px var(--state-active-color, #000);
  }
  .badge.error {
    --badge-color: var(--error-color, #db4437);
  }
  .content {
    display: flex;
    align-items: baseline;
    gap: 6px;
    line-height: 1;
  }
  .name {
    font-weight: 500;
  }
  .state {
    opacity: 0.9;
  }
  .arrow {
    opacity: 0.8;
    width: 18px;
    height: 18px;
  }
  .menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: 1000;
    min-width: 160px;
    max-width: 280px;
    max-height: 300px;
    overflow-y: auto;
    background: var(--card-background-color, var(--secondary-background-color, #fff));
    color: var(--primary-text-color, #000);
    border-radius: 8px;
    box-shadow: var(--shadow-elevation-8dp, 0 4px 12px rgba(0,0,0,0.2));
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
    background: var(--secondary-background-color, rgba(0,0,0,0.05));
  }
`;function r(i){return String(i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}var d=class extends HTMLElement{constructor(){super(),this._config=void 0,this._hass=void 0,this._open=!1,this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`<style>${C}</style><div class="badge"></div>`,this._boundToggle=this._toggleMenu.bind(this),this._boundClose=this._closeOnOutside.bind(this),this._boundKey=this._handleKey.bind(this)}connectedCallback(){this.shadowRoot.querySelector(".badge").addEventListener("click",this._boundToggle),document.addEventListener("click",this._boundClose),this.addEventListener("keydown",this._boundKey)}disconnectedCallback(){this.shadowRoot.querySelector(".badge").removeEventListener("click",this._boundToggle),document.removeEventListener("click",this._boundClose),this.removeEventListener("keydown",this._boundKey)}static async getConfigElement(){return await Promise.resolve().then(()=>(m(),_)),document.createElement("dropdown-badge-editor")}static getStubConfig(e,t){return{entity:t?.find(n=>n.startsWith("select.")||n.startsWith("input_select."))||"",show_state:!0,show_name:!1}}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}setConfig(e){if(!e||!e.entity)throw new Error("Entity is required");this._config={show_state:!0,show_name:!1,...e},this._render()}_formatState(e){return this._hass?.formatEntityState?this._hass.formatEntityState(e):e.state}_formatName(e){return this._config?.name?this._config.name:this._hass?.formatEntityName?this._hass.formatEntityName(e):e.attributes?.friendly_name||e.entity_id}_computeColor(){let e=this._config?.color;return e?e.startsWith("#")||e.startsWith("rgb")||e.startsWith("var(")?r(e):`var(--state-${e}-color, var(--${e}-color, ${r(e)}))`:""}_toggleMenu(e){e?.stopPropagation(),this._open=!this._open,this._renderMenu(),this._open&&this.shadowRoot.querySelector(".option")?.focus()}_closeOnOutside(e){if(!this._open)return;(e.composedPath?e.composedPath():[e.target]).includes(this)||(this._open=!1,this._renderMenu())}_handleKey(e){if(e.key==="Escape"){this._open=!1,this._renderMenu();return}if(!this._open)return;let t=Array.from(this.shadowRoot.querySelectorAll(".option")),o=t.indexOf(this.shadowRoot.activeElement);e.key==="ArrowDown"?(e.preventDefault(),t[(o+1)%t.length]?.focus()):e.key==="ArrowUp"?(e.preventDefault(),t[(o-1+t.length)%t.length]?.focus()):(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),o>=0&&this._select(t[o].dataset.value))}_select(e){if(this._open=!1,this._renderMenu(),!this._hass||!this._config)return;let t=g(this._config,e,this._config.entity);t&&this._hass.callService(t.domain,t.service,t.data)}_render(){if(!this.shadowRoot)return;let e=this.shadowRoot.querySelector(".badge");if(!this._config||!this._hass){e.className="badge error",e.innerHTML='<ha-icon icon="mdi:alert-circle"></ha-icon><span>Unavailable</span>',this._renderMenu();return}let t=this._hass.states?.[this._config.entity];if(!t){e.className="badge error",e.innerHTML='<ha-icon icon="mdi:alert-circle"></ha-icon><span>Entity not found</span>',this._renderMenu();return}e.className="badge",e.style.setProperty("--badge-color",this._computeColor()||"var(--state-inactive-color)"),e.setAttribute("tabindex","0"),e.setAttribute("role","button"),e.setAttribute("aria-haspopup","listbox"),e.setAttribute("aria-expanded",String(this._open));let o=this._config.show_name?this._formatName(t):"",n=this._config.show_state?this._formatState(t):"",s=this._config.icon?this._config.icon:t.attributes?.icon,a;s?a=`<ha-icon icon="${r(s)}"></ha-icon>`:a="<ha-state-icon></ha-state-icon>";let c="";o&&n?c=`<span class="content"><span class="name">${r(o)}</span><span class="state">${r(n)}</span></span>`:o?c=`<span class="content">${r(o)}</span>`:n&&(c=`<span class="content">${r(n)}</span>`);let b=p(this._hass,this._config).length?'<ha-icon icon="mdi:chevron-down" class="arrow"></ha-icon>':"";e.innerHTML=`${a}${c}${b}`;let h=e.querySelector("ha-state-icon");h&&(h.hass=this._hass,h.stateObj=t),this._renderMenu()}_renderMenu(){if(!this.shadowRoot)return;let e=this.shadowRoot.querySelector(".menu");if(e&&e.remove(),!this._open||!this._config||!this._hass)return;let t=p(this._hass,this._config);if(!t.length)return;let o=document.createElement("div");o.className="menu",o.setAttribute("role","listbox"),o.addEventListener("click",n=>n.stopPropagation());for(let n of t){let s=document.createElement("button");s.className="option",s.setAttribute("role","option"),s.setAttribute("tabindex","-1"),s.dataset.value=n.value,s.innerHTML=n.icon?`<ha-icon icon="${r(n.icon)}"></ha-icon><span>${r(n.label)}</span>`:`<span>${r(n.label)}</span>`,s.addEventListener("click",()=>this._select(n.value)),o.appendChild(s)}this.shadowRoot.appendChild(o)}};customElements.define("dropdown-badge",d);window.customBadges=window.customBadges||[];window.customBadges.push({type:"dropdown-badge",name:"Dropdown Badge",description:"A badge that displays an entity state and opens a dropdown menu on tap.",preview:!0,documentationURL:"https://github.com/portbusy/ha-dropdown-badge"});var A=d;export{A as default};
