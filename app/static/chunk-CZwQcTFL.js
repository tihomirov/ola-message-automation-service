import{$t as Zd,Bn as nS,Cn as ge,Ct as Se,En as id,Er as zt,Et as UI,Fn as m,Gt as Xo,Hn as ns,I as DC,Jn as ov,Jt as Yo,K as Gg,Kn as od,L as Dw,Ln as mn,Lt as Vz,M as Bg,Ot as Ud,P as Cp,Q as Ip,Qt as Za,Rt as WI,St as Sb,Tn as ib,Ut as Xe,V as FC,W as GI,Xt as Z,Y as Hg,Z as Ie,Zn as pv,Zt as ZI,_ as zt$1,_n as db,_t as Qr,an as _y,bn as ea,br as y3,bt as RI,c as Te,cr as t$,d as bt$1,et as Ko,ft as Pg,g as vn,h as se,in as _w,ir as re,it as Lt,j as AI,jn as jt,lt as NI,mn as cb,mr as ve,n as wt$1,nr as ra,nt as Lg,or as sd,ot as MI,p as qt,pr as v,qn as ot,r as Dn,rr as rb,rt as Lp,s as R,sn as ab,t as Mt,tn as Zo,tt as LI,un as b3,vt as R$1,wn as hC,wr as zo,xr as yb}from"./main-M7OX2UV7.js";import"./chunk-DwsF-KU9.js";import{a as mn$1,i as gn,n as Te$1,t as Ie$1}from"./chunk-Ds6MnJrE.js";import{n as Wt,t as Bt}from"./chunk-DmGQnGtb.js";import{l as se$1,o as de,r as Xe$1,s as fn,t as $n}from"./chunk-Dw1WhA6v.js";import{n as Pe,t as Be}from"./chunk-N3VestTX.js";import{a as k,i as j$1,n as T,r as _,t as A$1}from"./chunk-Bz-97Upj.js";import{n as j$2,t as L}from"./chunk-BJ8DDtSB.js";var it=(()=>{class c{labelPosition=`after`;static ɵfac=function(n){return new(n||c)};static ɵcmp=(function(){return ot({type:c,selectors:[[``,`mat-internal-form-field`,``]],hostAttrs:[1,`mdc-form-field`,`mat-internal-form-field`],hostVars:2,hostBindings:function(e,l){e&2&&mn(`mdc-form-field--align-end`,l.labelPosition===`before`)},inputs:{labelPosition:`labelPosition`},ngContentSelectors:[`*`],decls:1,vars:0,template:function(e,l){e&1&&(Xo(),Lt(0))},styles:[`.mat-internal-form-field {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}
.mat-internal-form-field > label, .mat-internal-form-field > .mat-internal-form-field-label {
  margin-left: 0;
  margin-right: auto;
  padding-left: 4px;
  padding-right: 0;
  order: 0;
}
[dir=rtl] .mat-internal-form-field > label, [dir=rtl] .mat-internal-form-field > .mat-internal-form-field-label {
  margin-left: auto;
  margin-right: 0;
  padding-left: 0;
  padding-right: 4px;
}

.mdc-form-field--align-end > label, .mdc-form-field--align-end > .mat-internal-form-field-label {
  margin-left: auto;
  margin-right: 0;
  padding-left: 0;
  padding-right: 4px;
  order: -1;
}
[dir=rtl] .mdc-form-field--align-end .mdc-form-field--align-end label, [dir=rtl] .mdc-form-field--align-end .mdc-form-field--align-end .mat-internal-form-field-label {
  margin-left: 0;
  margin-right: auto;
  padding-left: 4px;
  padding-right: 0;
}
`],encapsulation:2})})()}return c})();var st=new v(`mat-slide-toggle-default-options`,{providedIn:`root`,factory:()=>({disableToggleValue:!1,hideIcon:!1,disabledInteractive:!1})});var A=class{source;checked;constructor(o,t){this.source=o,this.checked=t}};var j=(()=>{class c{_elementRef=m(ge);_focusMonitor=m(Ud);_changeDetectorRef=m(nS);defaults=m(st);_injector=m(Z);_signalFormField=null;_onChange=t=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=!1;_createChangeEvent(t){return new A(this,t)}_labelId;get buttonId(){return`${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus()}_noopAnimations=Qr();_focused=!1;name=null;id;labelPosition=`after`;ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=!1;color;disabled=!1;fullWidth=!1;disableRipple=!1;tabIndex=0;get checked(){return this._checked}set checked(t){this._checked=t,this._changeDetectorRef.markForCheck()}hideIcon;disabledInteractive;change=new Ie;toggleChange=new Ie;get inputId(){return`${this.id||this._uniqueId}-input`}constructor(){m(zt).load(ov);let t=m(new yb(`tabindex`),{optional:!0}),n=this.defaults;this.tabIndex=t==null?0:parseInt(t)||0,this.color=n.color||`accent`,this.id=this._uniqueId=m(Zd).getId(`mat-mdc-slide-toggle-`),this.hideIcon=n.hideIcon??!1,this.disabledInteractive=n.disabledInteractive??!1,this._labelId=this._uniqueId+`-label`}ngOnInit(){this._signalFormField=this._injector.get(fn,void 0,{optional:!0,self:!0})}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,!0).subscribe(t=>{t===`keyboard`||t===`program`?(this._focused=!0,this._changeDetectorRef.markForCheck()):t||Promise.resolve().then(()=>{this._focused=!1,this._onTouched(),this._changeDetectorRef.markForCheck()})})}ngOnChanges(t){t.required&&this._validatorOnChange()}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef)}writeValue(t){this.checked=!!t}registerOnChange(t){this._onChange=t}registerOnTouched(t){this._onTouched=t}validate(t){return this.required&&t.value!==!0&&!this._signalFormField?{required:!0}:null}registerOnValidatorChange(t){this._validatorOnChange=t}setDisabledState(t){this.disabled=t,this._changeDetectorRef.markForCheck()}toggle(){this.checked=!this.checked,this._onChange(this.checked)}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked))}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new A(this,this.checked))))}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static ɵfac=function(n){return new(n||c)};static ɵcmp=(function(){let t=[`switch`],n=[`*`];function e(l,v){l&1&&(ea(0,`span`,11),Lp(),ea(1,`svg`,13),Lg(2,`path`,14),od(),ea(3,`svg`,15),Lg(4,`path`,16),od()())}return ot({type:c,selectors:[[`mat-slide-toggle`]],viewQuery:function(v,g){if(v&1&&Gg(t,5),v&2){let P;GI(P=WI())&&(g._switchElement=P.first)}},hostAttrs:[1,`mat-mdc-slide-toggle`],hostVars:15,hostBindings:function(v,g){v&2&&(Bg(`id`,g.id),Zo(`tabindex`,null)(`aria-label`,null)(`name`,null)(`aria-labelledby`,null),id(g.color?`mat-`+g.color:``),mn(`mat-mdc-slide-toggle-focused`,g._focused)(`mat-mdc-slide-toggle-checked`,g.checked)(`mat-slide-toggle-full-width`,g.fullWidth)(`_mat-animation-noopable`,g._noopAnimations))},inputs:{name:`name`,id:`id`,labelPosition:`labelPosition`,ariaLabel:[0,`aria-label`,`ariaLabel`],ariaLabelledby:[0,`aria-labelledby`,`ariaLabelledby`],ariaDescribedby:[0,`aria-describedby`,`ariaDescribedby`],required:[2,`required`,`required`,jt],color:`color`,disabled:[2,`disabled`,`disabled`,jt],fullWidth:[2,`fullWidth`,`fullWidth`,jt],disableRipple:[2,`disableRipple`,`disableRipple`,jt],tabIndex:[2,`tabIndex`,`tabIndex`,l=>l==null?0:Sb(l)],checked:[2,`checked`,`checked`,jt],hideIcon:[2,`hideIcon`,`hideIcon`,jt],disabledInteractive:[2,`disabledInteractive`,`disabledInteractive`,jt]},outputs:{change:`change`,toggleChange:`toggleChange`},exportAs:[`matSlideToggle`],features:[db([{provide:se,useExisting:ns(()=>c),multi:!0},{provide:R,useExisting:c,multi:!0}]),ra],ngContentSelectors:n,decls:14,vars:27,consts:[[`switch`,``],[`mat-internal-form-field`,``,3,`labelPosition`],[`role`,`switch`,`type`,`button`,1,`mdc-switch`,3,`click`,`tabIndex`,`disabled`],[1,`mat-mdc-slide-toggle-touch-target`],[1,`mdc-switch__track`],[1,`mdc-switch__handle-track`],[1,`mdc-switch__handle`],[1,`mdc-switch__shadow`],[1,`mdc-elevation-overlay`],[1,`mdc-switch__ripple`],[`mat-ripple`,``,1,`mat-mdc-slide-toggle-ripple`,`mat-focus-indicator`,3,`matRippleTrigger`,`matRippleDisabled`,`matRippleCentered`],[1,`mdc-switch__icons`],[1,`mdc-label`,3,`click`,`for`],[`viewBox`,`0 0 24 24`,`aria-hidden`,`true`,1,`mdc-switch__icon`,`mdc-switch__icon--on`],[`d`,`M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z`],[`viewBox`,`0 0 24 24`,`aria-hidden`,`true`,1,`mdc-switch__icon`,`mdc-switch__icon--off`],[`d`,`M20 13H4v-2h16v2z`]],template:function(v,g){if(v&1&&(Xo(),ea(0,`div`,1)(1,`button`,2,0),Hg(`click`,function(){return g._handleClick()}),Lg(3,`div`,3)(4,`span`,4),ea(5,`span`,5)(6,`span`,6)(7,`span`,7),Lg(8,`span`,8),od(),ea(9,`span`,9),Lg(10,`span`,10),od(),Yo(11,e,5,0,`span`,11),od()()(),ea(12,`label`,12),Hg(`click`,function(rt){return rt.stopPropagation()}),Lt(13),od()()),v&2){let P=ZI(2);Pg(`labelPosition`,g.labelPosition),zo(),mn(`mdc-switch--selected`,g.checked)(`mdc-switch--unselected`,!g.checked)(`mdc-switch--checked`,g.checked)(`mdc-switch--disabled`,g.disabled)(`mat-mdc-slide-toggle-disabled-interactive`,g.disabledInteractive),Pg(`tabIndex`,g.disabled&&!g.disabledInteractive?-1:g.tabIndex)(`disabled`,g.disabled&&!g.disabledInteractive),Zo(`id`,g.buttonId)(`name`,g.name)(`aria-label`,g.ariaLabel)(`aria-labelledby`,g._getAriaLabelledBy())(`aria-describedby`,g.ariaDescribedby)(`aria-required`,g.required||null)(`aria-checked`,g.checked)(`aria-disabled`,g.disabled&&g.disabledInteractive?`true`:null),zo(9),Pg(`matRippleTrigger`,P)(`matRippleDisabled`,g.disableRipple||g.disabled)(`matRippleCentered`,!0),zo(),Ko(g.hideIcon?-1:11),zo(),Pg(`for`,g.buttonId),Zo(`id`,g._labelId)}},dependencies:[Vz,it],styles:[`.mdc-switch {
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  margin: 0;
  outline: none;
  overflow: visible;
  padding: 0;
  position: relative;
  width: var(--%NS%mat-slide-toggle-track-width, 52px);
}
.mdc-switch.mdc-switch--disabled {
  cursor: default;
  pointer-events: none;
}
.mdc-switch.mat-mdc-slide-toggle-disabled-interactive {
  pointer-events: auto;
}

.mdc-switch__track {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: var(--%NS%mat-slide-toggle-track-height, 32px);
  border-radius: var(--%NS%mat-slide-toggle-track-shape, var(--%NS%mat-sys-corner-full));
}
.mdc-switch--disabled.mdc-switch .mdc-switch__track {
  opacity: var(--%NS%mat-slide-toggle-disabled-track-opacity, 0.12);
}
.mdc-switch__track::before, .mdc-switch__track::after {
  border: 1px solid transparent;
  border-radius: inherit;
  box-sizing: border-box;
  content: "";
  height: 100%;
  left: 0;
  position: absolute;
  width: 100%;
  border-width: var(--%NS%mat-slide-toggle-track-outline-width, 2px);
  border-color: var(--%NS%mat-slide-toggle-track-outline-color, var(--%NS%mat-sys-outline));
}
.mdc-switch--selected .mdc-switch__track::before, .mdc-switch--selected .mdc-switch__track::after {
  border-width: var(--%NS%mat-slide-toggle-selected-track-outline-width, 2px);
  border-color: var(--%NS%mat-slide-toggle-selected-track-outline-color, transparent);
}
.mdc-switch--disabled .mdc-switch__track::before, .mdc-switch--disabled .mdc-switch__track::after {
  border-width: var(--%NS%mat-slide-toggle-disabled-unselected-track-outline-width, 2px);
  border-color: var(--%NS%mat-slide-toggle-disabled-unselected-track-outline-color, var(--%NS%mat-sys-on-surface));
}
@media (forced-colors: active) {
  .mdc-switch__track {
    border-color: currentColor;
  }
}
.mdc-switch__track::before {
  transition: transform 75ms 0ms cubic-bezier(0, 0, 0.2, 1);
  transform: translateX(0);
  background: var(--%NS%mat-slide-toggle-unselected-track-color, var(--%NS%mat-sys-surface-variant));
}
.mdc-switch--selected .mdc-switch__track::before {
  transition: transform 75ms 0ms cubic-bezier(0.4, 0, 0.6, 1);
  transform: translateX(100%);
}
[dir=rtl] .mdc-switch--selected .mdc-switch--selected .mdc-switch__track::before {
  transform: translateX(-100%);
}
.mdc-switch--selected .mdc-switch__track::before {
  opacity: var(--%NS%mat-slide-toggle-hidden-track-opacity, 0);
  transition: var(--%NS%mat-slide-toggle-hidden-track-transition, opacity 75ms);
}
.mdc-switch--unselected .mdc-switch__track::before {
  opacity: var(--%NS%mat-slide-toggle-visible-track-opacity, 1);
  transition: var(--%NS%mat-slide-toggle-visible-track-transition, opacity 75ms);
}
.mdc-switch:enabled:hover:not(:focus):not(:active) .mdc-switch__track::before {
  background: var(--%NS%mat-slide-toggle-unselected-hover-track-color, var(--%NS%mat-sys-surface-variant));
}
.mdc-switch:enabled:focus:not(:active) .mdc-switch__track::before {
  background: var(--%NS%mat-slide-toggle-unselected-focus-track-color, var(--%NS%mat-sys-surface-variant));
}
.mdc-switch:enabled:active .mdc-switch__track::before {
  background: var(--%NS%mat-slide-toggle-unselected-pressed-track-color, var(--%NS%mat-sys-surface-variant));
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:hover:not(:focus):not(:active) .mdc-switch__track::before, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:focus:not(:active) .mdc-switch__track::before, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:active .mdc-switch__track::before, .mdc-switch.mdc-switch--disabled .mdc-switch__track::before {
  background: var(--%NS%mat-slide-toggle-disabled-unselected-track-color, var(--%NS%mat-sys-surface-variant));
}
.mdc-switch__track::after {
  transform: translateX(-100%);
  background: var(--%NS%mat-slide-toggle-selected-track-color, var(--%NS%mat-sys-primary));
}
[dir=rtl] .mdc-switch__track::after {
  transform: translateX(100%);
}
.mdc-switch--selected .mdc-switch__track::after {
  transform: translateX(0);
}
.mdc-switch--selected .mdc-switch__track::after {
  opacity: var(--%NS%mat-slide-toggle-visible-track-opacity, 1);
  transition: var(--%NS%mat-slide-toggle-visible-track-transition, opacity 75ms);
}
.mdc-switch--unselected .mdc-switch__track::after {
  opacity: var(--%NS%mat-slide-toggle-hidden-track-opacity, 0);
  transition: var(--%NS%mat-slide-toggle-hidden-track-transition, opacity 75ms);
}
.mdc-switch:enabled:hover:not(:focus):not(:active) .mdc-switch__track::after {
  background: var(--%NS%mat-slide-toggle-selected-hover-track-color, var(--%NS%mat-sys-primary));
}
.mdc-switch:enabled:focus:not(:active) .mdc-switch__track::after {
  background: var(--%NS%mat-slide-toggle-selected-focus-track-color, var(--%NS%mat-sys-primary));
}
.mdc-switch:enabled:active .mdc-switch__track::after {
  background: var(--%NS%mat-slide-toggle-selected-pressed-track-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:hover:not(:focus):not(:active) .mdc-switch__track::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:focus:not(:active) .mdc-switch__track::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:active .mdc-switch__track::after, .mdc-switch.mdc-switch--disabled .mdc-switch__track::after {
  background: var(--%NS%mat-slide-toggle-disabled-selected-track-color, var(--%NS%mat-sys-on-surface));
}

.mdc-switch__handle-track {
  height: 100%;
  pointer-events: none;
  position: absolute;
  top: 0;
  transition: transform 75ms 0ms cubic-bezier(0.4, 0, 0.2, 1);
  left: 0;
  right: auto;
  transform: translateX(0);
  width: calc(100% - var(--%NS%mat-slide-toggle-handle-width));
}
[dir=rtl] .mdc-switch__handle-track {
  left: auto;
  right: 0;
}
.mdc-switch--selected .mdc-switch__handle-track {
  transform: translateX(100%);
}
[dir=rtl] .mdc-switch--selected .mdc-switch__handle-track {
  transform: translateX(-100%);
}

.mdc-switch__handle {
  display: flex;
  pointer-events: auto;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  right: auto;
  transition: width 75ms cubic-bezier(0.4, 0, 0.2, 1), height 75ms cubic-bezier(0.4, 0, 0.2, 1), margin 75ms cubic-bezier(0.4, 0, 0.2, 1);
  width: var(--%NS%mat-slide-toggle-handle-width);
  height: var(--%NS%mat-slide-toggle-handle-height);
  border-radius: var(--%NS%mat-slide-toggle-handle-shape, var(--%NS%mat-sys-corner-full));
}
[dir=rtl] .mdc-switch__handle {
  left: auto;
  right: 0;
}
.mat-mdc-slide-toggle .mdc-switch--unselected .mdc-switch__handle {
  width: var(--%NS%mat-slide-toggle-unselected-handle-size, 16px);
  height: var(--%NS%mat-slide-toggle-unselected-handle-size, 16px);
  margin: var(--%NS%mat-slide-toggle-unselected-handle-horizontal-margin, 0 8px);
}
.mat-mdc-slide-toggle .mdc-switch--unselected .mdc-switch__handle:has(.mdc-switch__icons) {
  margin: var(--%NS%mat-slide-toggle-unselected-with-icon-handle-horizontal-margin, 0 4px);
}
.mat-mdc-slide-toggle .mdc-switch--selected .mdc-switch__handle {
  width: var(--%NS%mat-slide-toggle-selected-handle-size, 24px);
  height: var(--%NS%mat-slide-toggle-selected-handle-size, 24px);
  margin: var(--%NS%mat-slide-toggle-selected-handle-horizontal-margin, 0 24px);
}
.mat-mdc-slide-toggle .mdc-switch--selected .mdc-switch__handle:has(.mdc-switch__icons) {
  margin: var(--%NS%mat-slide-toggle-selected-with-icon-handle-horizontal-margin, 0 24px);
}
.mat-mdc-slide-toggle .mdc-switch__handle:has(.mdc-switch__icons) {
  width: var(--%NS%mat-slide-toggle-with-icon-handle-size, 24px);
  height: var(--%NS%mat-slide-toggle-with-icon-handle-size, 24px);
}
.mat-mdc-slide-toggle .mdc-switch:active:not(.mdc-switch--disabled) .mdc-switch__handle {
  width: var(--%NS%mat-slide-toggle-pressed-handle-size, 28px);
  height: var(--%NS%mat-slide-toggle-pressed-handle-size, 28px);
}
.mat-mdc-slide-toggle .mdc-switch--%NS%selected:active:not(.mdc-switch--disabled) .mdc-switch__handle {
  margin: var(--%NS%mat-slide-toggle-selected-pressed-handle-horizontal-margin, 0 22px);
}
.mat-mdc-slide-toggle .mdc-switch--%NS%unselected:active:not(.mdc-switch--disabled) .mdc-switch__handle {
  margin: var(--%NS%mat-slide-toggle-unselected-pressed-handle-horizontal-margin, 0 2px);
}
.mdc-switch--disabled.mdc-switch--selected .mdc-switch__handle::after {
  opacity: var(--%NS%mat-slide-toggle-disabled-selected-handle-opacity, 1);
}
.mdc-switch--disabled.mdc-switch--unselected .mdc-switch__handle::after {
  opacity: var(--%NS%mat-slide-toggle-disabled-unselected-handle-opacity, 0.38);
}
.mdc-switch__handle::before, .mdc-switch__handle::after {
  border: 1px solid transparent;
  border-radius: inherit;
  box-sizing: border-box;
  content: "";
  width: 100%;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  transition: background-color 75ms 0ms cubic-bezier(0.4, 0, 0.2, 1), border-color 75ms 0ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}
@media (forced-colors: active) {
  .mdc-switch__handle::before, .mdc-switch__handle::after {
    border-color: currentColor;
  }
}
.mdc-switch--%NS%selected:enabled .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-selected-handle-color, var(--%NS%mat-sys-on-primary));
}
.mdc-switch--%NS%selected:enabled:hover:not(:focus):not(:active) .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-selected-hover-handle-color, var(--%NS%mat-sys-primary-container));
}
.mdc-switch--%NS%selected:enabled:focus:not(:active) .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-selected-focus-handle-color, var(--%NS%mat-sys-primary-container));
}
.mdc-switch--%NS%selected:enabled:active .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-selected-pressed-handle-color, var(--%NS%mat-sys-primary-container));
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled.mdc-switch--%NS%selected:hover:not(:focus):not(:active) .mdc-switch__handle::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled.mdc-switch--%NS%selected:focus:not(:active) .mdc-switch__handle::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled.mdc-switch--%NS%selected:active .mdc-switch__handle::after, .mdc-switch--selected.mdc-switch--disabled .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-disabled-selected-handle-color, var(--%NS%mat-sys-surface));
}
.mdc-switch--%NS%unselected:enabled .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-unselected-handle-color, var(--%NS%mat-sys-outline));
}
.mdc-switch--%NS%unselected:enabled:hover:not(:focus):not(:active) .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-unselected-hover-handle-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-switch--%NS%unselected:enabled:focus:not(:active) .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-unselected-focus-handle-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-switch--%NS%unselected:enabled:active .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-unselected-pressed-handle-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-switch--unselected.mdc-switch--disabled .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-disabled-unselected-handle-color, var(--%NS%mat-sys-on-surface));
}
.mdc-switch__handle::before {
  background: var(--%NS%mat-slide-toggle-handle-surface-color);
}

.mdc-switch__shadow {
  border-radius: inherit;
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}
.mdc-switch:enabled .mdc-switch__shadow {
  box-shadow: var(--%NS%mat-slide-toggle-handle-elevation-shadow);
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:hover:not(:focus):not(:active) .mdc-switch__shadow, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:focus:not(:active) .mdc-switch__shadow, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:active .mdc-switch__shadow, .mdc-switch.mdc-switch--disabled .mdc-switch__shadow {
  box-shadow: var(--%NS%mat-slide-toggle-disabled-handle-elevation-shadow);
}

.mdc-switch__ripple {
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
  width: var(--%NS%mat-slide-toggle-state-layer-size, 40px);
  height: var(--%NS%mat-slide-toggle-state-layer-size, 40px);
}
.mdc-switch__ripple::after {
  content: "";
  opacity: 0;
}
.mdc-switch--disabled .mdc-switch__ripple::after {
  display: none;
}
.mat-mdc-slide-toggle-disabled-interactive .mdc-switch__ripple::after {
  display: block;
}
.mdc-switch:hover .mdc-switch__ripple::after {
  transition: 75ms opacity cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:enabled:focus .mdc-switch__ripple::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:enabled:active .mdc-switch__ripple::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:enabled:hover:not(:focus) .mdc-switch__ripple::after, .mdc-switch--%NS%unselected:enabled:hover:not(:focus) .mdc-switch__ripple::after {
  background: var(--%NS%mat-slide-toggle-unselected-hover-state-layer-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-slide-toggle-unselected-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mdc-switch--%NS%unselected:enabled:focus .mdc-switch__ripple::after {
  background: var(--%NS%mat-slide-toggle-unselected-focus-state-layer-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-slide-toggle-unselected-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mdc-switch--%NS%unselected:enabled:active .mdc-switch__ripple::after {
  background: var(--%NS%mat-slide-toggle-unselected-pressed-state-layer-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-slide-toggle-unselected-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
  transition: opacity 75ms linear;
}
.mdc-switch--%NS%selected:enabled:hover:not(:focus) .mdc-switch__ripple::after {
  background: var(--%NS%mat-slide-toggle-selected-hover-state-layer-color, var(--%NS%mat-sys-primary));
  opacity: var(--%NS%mat-slide-toggle-selected-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mdc-switch--%NS%selected:enabled:focus .mdc-switch__ripple::after {
  background: var(--%NS%mat-slide-toggle-selected-focus-state-layer-color, var(--%NS%mat-sys-primary));
  opacity: var(--%NS%mat-slide-toggle-selected-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mdc-switch--%NS%selected:enabled:active .mdc-switch__ripple::after {
  background: var(--%NS%mat-slide-toggle-selected-pressed-state-layer-color, var(--%NS%mat-sys-primary));
  opacity: var(--%NS%mat-slide-toggle-selected-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
  transition: opacity 75ms linear;
}

.mdc-switch__icons {
  position: relative;
  height: 100%;
  width: 100%;
  z-index: 1;
  transform: translateZ(0);
}
.mdc-switch--disabled.mdc-switch--unselected .mdc-switch__icons {
  opacity: var(--%NS%mat-slide-toggle-disabled-unselected-icon-opacity, 0.38);
}
.mdc-switch--disabled.mdc-switch--selected .mdc-switch__icons {
  opacity: var(--%NS%mat-slide-toggle-disabled-selected-icon-opacity, 0.38);
}

.mdc-switch__icon {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  opacity: 0;
  transition: opacity 30ms 0ms cubic-bezier(0.4, 0, 1, 1);
}
.mdc-switch--unselected .mdc-switch__icon {
  width: var(--%NS%mat-slide-toggle-unselected-icon-size, 16px);
  height: var(--%NS%mat-slide-toggle-unselected-icon-size, 16px);
  fill: var(--%NS%mat-slide-toggle-unselected-icon-color, var(--%NS%mat-sys-surface-variant));
}
.mdc-switch--unselected.mdc-switch--disabled .mdc-switch__icon {
  fill: var(--%NS%mat-slide-toggle-disabled-unselected-icon-color, var(--%NS%mat-sys-surface-variant));
}
.mdc-switch--selected .mdc-switch__icon {
  width: var(--%NS%mat-slide-toggle-selected-icon-size, 16px);
  height: var(--%NS%mat-slide-toggle-selected-icon-size, 16px);
  fill: var(--%NS%mat-slide-toggle-selected-icon-color, var(--%NS%mat-sys-on-primary-container));
}
.mdc-switch--selected.mdc-switch--disabled .mdc-switch__icon {
  fill: var(--%NS%mat-slide-toggle-disabled-selected-icon-color, var(--%NS%mat-sys-on-surface));
}

.mdc-switch--selected .mdc-switch__icon--on,
.mdc-switch--unselected .mdc-switch__icon--off {
  opacity: 1;
  transition: opacity 45ms 30ms cubic-bezier(0, 0, 0.2, 1);
}

.mat-mdc-slide-toggle {
  -webkit-user-select: none;
  user-select: none;
  display: inline-block;
  -webkit-tap-highlight-color: transparent;
  outline: 0;
}
.mat-mdc-slide-toggle .mat-icon {
  min-height: fit-content;
  flex-shrink: 0;
}
.mat-mdc-slide-toggle .mat-mdc-slide-toggle-ripple,
.mat-mdc-slide-toggle .mdc-switch__ripple::after {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.mat-mdc-slide-toggle .mat-mdc-slide-toggle-ripple:not(:empty),
.mat-mdc-slide-toggle .mdc-switch__ripple::after:not(:empty) {
  transform: translateZ(0);
}
.mat-mdc-slide-toggle.mat-mdc-slide-toggle-focused .mat-focus-indicator::before {
  content: "";
}
.mat-mdc-slide-toggle .mat-internal-form-field {
  color: var(--%NS%mat-slide-toggle-label-text-color, var(--%NS%mat-sys-on-surface));
  font-family: var(--%NS%mat-slide-toggle-label-text-font, var(--%NS%mat-sys-body-medium-font));
  line-height: var(--%NS%mat-slide-toggle-label-text-line-height, var(--%NS%mat-sys-body-medium-line-height));
  font-size: var(--%NS%mat-slide-toggle-label-text-size, var(--%NS%mat-sys-body-medium-size));
  letter-spacing: var(--%NS%mat-slide-toggle-label-text-tracking, var(--%NS%mat-sys-body-medium-tracking));
  font-weight: var(--%NS%mat-slide-toggle-label-text-weight, var(--%NS%mat-sys-body-medium-weight));
}
.mat-mdc-slide-toggle .mat-ripple-element {
  opacity: 0.12;
}
.mat-mdc-slide-toggle .mat-focus-indicator::before {
  border-radius: 50%;
}
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__handle-track,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__icon,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__handle::before,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__handle::after,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__track::before,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__track::after {
  transition: none;
}
.mat-mdc-slide-toggle .mdc-switch:enabled + .mdc-label {
  cursor: pointer;
}
.mat-mdc-slide-toggle .mdc-switch--disabled + label {
  color: var(--%NS%mat-slide-toggle-disabled-label-text-color, var(--%NS%mat-sys-on-surface));
}
.mat-mdc-slide-toggle label:empty {
  display: none;
}

.mat-slide-toggle-full-width {
  width: 100%;
}
.mat-slide-toggle-full-width .mat-internal-form-field {
  width: 100%;
  justify-content: space-between;
}
.mat-slide-toggle-full-width .mat-internal-form-field label {
  margin: 0;
  flex-grow: 1;
  text-align: end;
}
.mat-slide-toggle-full-width .mdc-form-field--align-end label {
  text-align: start;
}

.mat-mdc-slide-toggle-touch-target {
  position: absolute;
  top: 50%;
  left: 50%;
  height: var(--%NS%mat-slide-toggle-touch-target-size, 48px);
  width: 100%;
  transform: translate(-50%, -50%);
  display: var(--%NS%mat-slide-toggle-touch-target-display, block);
}
[dir=rtl] .mat-mdc-slide-toggle-touch-target {
  left: auto;
  right: 50%;
  transform: translate(50%, -50%);
}
`],encapsulation:2})})()}return c})();var at=(()=>{class c{static ɵfac=function(n){return new(n||c)};static ɵmod=Se({type:c});static ɵinj=ve({imports:[j,Za]})}return c})();function ct(c,o){if(c&1&&(ea(0,`p`,0),hC(1),od()),c&2){let t=UI();zo(),rb(t.error())}}function mt(c,o){if(c&1&&(ea(0,`li`),hC(1),od()),c&2){let t=o.$implicit;zo(),rb(t)}}function gt(c,o){if(c&1&&(ea(0,`mat-card`,1)(1,`mat-card-content`)(2,`strong`),hC(3,`The mail worker is not running:`),od(),ea(4,`ul`),AI(5,mt,2,1,`li`,null,MI),od()()()),c&2){let t=UI(2);zo(5),RI(t.problems())}}function ht(c,o){if(c&1&&(ea(0,`div`),hC(1),od()),c&2){let t=o.$implicit;zo(),sd(`⚠️ `,t)}}function _t(c,o){if(c&1&&(ea(0,`mat-card`,2)(1,`mat-card-content`),AI(2,ht,2,1,`div`,null,MI),od()()),c&2){let t=UI(2);zo(2),RI(t.warnings())}}function pt(c,o){c&1&&(ea(0,`span`,4),hC(1,`Save first to test`),od())}function ut(c,o){c&1&&Lg(0,`mat-progress-bar`,20)}function ft(c,o){if(c&1&&(ea(0,`h4`),hC(1),od(),ea(2,`pre`),hC(3),od()),c&2){let t=o.$implicit;zo(),rb(t.subject),zo(2),rb(t.text)}}function bt(c,o){if(c&1&&(ea(0,`mat-card`)(1,`mat-card-header`)(2,`mat-card-title`),hC(3,`Dry run: what the next poll would send`),od()(),ea(4,`mat-card-content`)(5,`p`),hC(6),od(),AI(7,ft,4,2,null,null,NI),od()()),c&2){let t=o;zo(6),ib(`Found `,t.found,` email(s): `,t.previews.length,` new order(s), `,t.duplicates,` already sent, `,t.ignored,` not an order. Nothing was sent or labelled.`),zo(),RI(t.previews)}}function wt(c,o){if(c&1){let t=LI();Yo(0,gt,7,0,`mat-card`,1),Yo(1,_t,4,0,`mat-card`,2),ea(2,`mat-card`)(3,`mat-card-header`)(4,`mat-card-title`),hC(5,`Flow`),od()(),ea(6,`mat-card-content`)(7,`mat-slide-toggle`,3),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.features.fetch_order_details,e)||(l.features.fetch_order_details=e),Cp(e)}),Hg(`change`,function(){Ip(t);let e=UI();return Cp(e.touch())}),hC(8,` Fetch order details from the shop (flow 2) `),od(),ea(9,`p`,4),hC(10,` Off (flow 1): the message is built from the order email only, without sizes. On (flow 2): the service also logs in to the shop admin and adds sizes. Configure it on the `),ea(11,`b`),hC(12,`Shop`),od(),hC(13,` page, which appears after saving. `),od()()(),ea(14,`mat-card`)(15,`mat-card-header`)(16,`mat-card-title`),hC(17,`Mailbox (order emails)`),od()(),ea(18,`mat-card-content`)(19,`mat-slide-toggle`,3),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.mailbox.enabled,e)||(l.mailbox.enabled=e),Cp(e)}),Hg(`change`,function(){Ip(t);let e=UI();return Cp(e.touch())}),hC(20,`Poll the mailbox`),od(),ea(21,`div`,5)(22,`mat-form-field`,6)(23,`mat-label`),hC(24,`Gmail address`),od(),ea(25,`input`,7),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.mailbox.username,e)||(l.mailbox.username=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()(),ea(26,`mat-form-field`,6)(27,`mat-label`),hC(28,`App password`),od(),ea(29,`input`,8),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.mailbox.password,e)||(l.mailbox.password=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od(),ea(30,`mat-hint`),hC(31,`Leave as is to keep the saved one`),od()()(),ea(32,`div`,5)(33,`mat-form-field`,6)(34,`mat-label`),hC(35,`Check every (seconds)`),od(),ea(36,`input`,9),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.mailbox.poll_interval_seconds,e)||(l.mailbox.poll_interval_seconds=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()(),ea(37,`mat-form-field`,6)(38,`mat-label`),hC(39,`Look back (days)`),od(),ea(40,`input`,10),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.mailbox.lookback_days,e)||(l.mailbox.lookback_days=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od(),ea(41,`mat-hint`),hC(42,`Also the catch-up window after downtime`),od()(),ea(43,`mat-form-field`,6)(44,`mat-label`),hC(45,`Send attempts before "failed"`),od(),ea(46,`input`,10),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.mailbox.max_attempts,e)||(l.mailbox.max_attempts=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()()(),ea(47,`div`,5)(48,`mat-form-field`,6)(49,`mat-label`),hC(50,`Shop sender(s)`),od(),ea(51,`textarea`,11),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.lists.senders,e)||(l.lists.senders=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od(),ea(52,`mat-hint`),hC(53,`One per line`),od()(),ea(54,`mat-form-field`,6)(55,`mat-label`),hC(56,`Accept manual "Fwd:" from`),od(),ea(57,`textarea`,11),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.lists.forwarders,e)||(l.lists.forwarders=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od(),ea(58,`mat-hint`),hC(59,`Optional, one per line`),od()()(),ea(60,`mat-expansion-panel`,12)(61,`mat-expansion-panel-header`)(62,`mat-panel-title`),hC(63,`Advanced`),od()(),ea(64,`div`,5)(65,`mat-form-field`,6)(66,`mat-label`),hC(67,`IMAP host`),od(),ea(68,`input`,13),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.mailbox.host,e)||(l.mailbox.host=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()(),ea(69,`mat-form-field`,6)(70,`mat-label`),hC(71,`Port`),od(),ea(72,`input`,14),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.mailbox.port,e)||(l.mailbox.port=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()(),ea(73,`mat-form-field`,6)(74,`mat-label`),hC(75,`Folder`),od(),ea(76,`input`,13),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.mailbox.folder,e)||(l.mailbox.folder=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()()(),ea(77,`div`,5)(78,`mat-form-field`,6)(79,`mat-label`),hC(80,`Processed label`),od(),ea(81,`input`,13),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.mailbox.processed_label,e)||(l.mailbox.processed_label=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()(),ea(82,`mat-form-field`,6)(83,`mat-label`),hC(84,`Ignored label`),od(),ea(85,`input`,13),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.mailbox.ignored_label,e)||(l.mailbox.ignored_label=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()(),ea(86,`mat-form-field`,6)(87,`mat-label`),hC(88,`Failed label`),od(),ea(89,`input`,13),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.mailbox.failed_label,e)||(l.mailbox.failed_label=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()()()()()(),ea(90,`mat-card`)(91,`mat-card-header`)(92,`mat-card-title`),hC(93,`Email notifications`),od()(),ea(94,`mat-card-content`)(95,`mat-slide-toggle`,3),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.email.enabled,e)||(l.email.enabled=e),Cp(e)}),Hg(`change`,function(){Ip(t);let e=UI();return Cp(e.touch())}),hC(96,`Send notifications by email`),od(),ea(97,`div`,5)(98,`mat-form-field`,15)(99,`mat-label`),hC(100,`Send to`),od(),ea(101,`textarea`,11),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.lists.to,e)||(l.lists.to=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od(),ea(102,`mat-hint`),hC(103,`One address per line`),od()(),ea(104,`mat-form-field`,6)(105,`mat-label`),hC(106,`Sender name`),od(),ea(107,`input`,13),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.email.from_name,e)||(l.email.from_name=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()()(),ea(108,`p`,4),hC(109,`The subject and message text are on the `),ea(110,`b`),hC(111,`Message`),od(),hC(112,` page.`),od(),ea(113,`mat-expansion-panel`,12)(114,`mat-expansion-panel-header`)(115,`mat-panel-title`),hC(116,`SMTP (advanced)`),od()(),ea(117,`p`,4),hC(118,`Empty username/password = same as the mailbox account.`),od(),ea(119,`div`,5)(120,`mat-form-field`,6)(121,`mat-label`),hC(122,`SMTP host`),od(),ea(123,`input`,13),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.email.smtp_host,e)||(l.email.smtp_host=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()(),ea(124,`mat-form-field`,6)(125,`mat-label`),hC(126,`Port (587 STARTTLS / 465 SSL)`),od(),ea(127,`input`,14),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.email.smtp_port,e)||(l.email.smtp_port=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()()(),ea(128,`div`,5)(129,`mat-form-field`,6)(130,`mat-label`),hC(131,`Username`),od(),ea(132,`input`,7),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.email.username,e)||(l.email.username=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()(),ea(133,`mat-form-field`,6)(134,`mat-label`),hC(135,`Password`),od(),ea(136,`input`,8),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.email.password,e)||(l.email.password=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()()()()()(),ea(137,`mat-card`)(138,`mat-card-header`)(139,`mat-card-title`),hC(140,`Storage`),od()(),ea(141,`mat-card-content`)(142,`div`,5)(143,`mat-form-field`,6)(144,`mat-label`),hC(145,`Max DB size (MB)`),od(),ea(146,`input`,10),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.storage.max_size_mb,e)||(l.storage.max_size_mb=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()(),ea(147,`mat-form-field`,6)(148,`mat-label`),hC(149,`Keep history (days)`),od(),ea(150,`input`,10),Dw(),cb(`ngModelChange`,function(e){let l=Ip(t);return DC(l.storage.retention_days,e)||(l.storage.retention_days=e),Cp(e)}),Hg(`input`,function(){Ip(t);let e=UI();return Cp(e.touch())}),od()()()()(),ea(151,`div`,16)(152,`button`,17),Hg(`click`,function(){Ip(t);let e=UI();return Cp(e.save())}),Lg(153,`mat-icon`,18),hC(154,` Save`),od(),ea(155,`button`,19),Hg(`click`,function(){Ip(t);let e=UI();return Cp(e.testMailbox())}),hC(156,`Test mailbox`),od(),ea(157,`button`,19),Hg(`click`,function(){Ip(t);let e=UI();return Cp(e.testEmail())}),hC(158,`Send test email`),od(),ea(159,`button`,19),Hg(`click`,function(){Ip(t);let e=UI();return Cp(e.dryRun())}),hC(160,`Dry run`),od(),Yo(161,pt,2,0,`span`,4),od(),Yo(162,ut,1,0,`mat-progress-bar`,20),Yo(163,bt,9,4,`mat-card`)}if(c&2){let t,n=o,e=UI();Ko(e.problems().length?0:-1),zo(),Ko(e.warnings().length?1:-1),zo(6),ab(`ngModel`,n.features.fetch_order_details),_w(),zo(12),ab(`ngModel`,n.mailbox.enabled),_w(),zo(6),ab(`ngModel`,n.mailbox.username),_w(),zo(4),ab(`ngModel`,n.mailbox.password),_w(),zo(7),ab(`ngModel`,n.mailbox.poll_interval_seconds),_w(),zo(4),ab(`ngModel`,n.mailbox.lookback_days),_w(),zo(6),ab(`ngModel`,n.mailbox.max_attempts),_w(),zo(5),ab(`ngModel`,n.lists.senders),_w(),zo(6),ab(`ngModel`,n.lists.forwarders),_w(),zo(11),ab(`ngModel`,n.mailbox.host),_w(),zo(4),ab(`ngModel`,n.mailbox.port),_w(),zo(4),ab(`ngModel`,n.mailbox.folder),_w(),zo(5),ab(`ngModel`,n.mailbox.processed_label),_w(),zo(4),ab(`ngModel`,n.mailbox.ignored_label),_w(),zo(4),ab(`ngModel`,n.mailbox.failed_label),_w(),zo(6),ab(`ngModel`,n.email.enabled),_w(),zo(6),ab(`ngModel`,n.lists.to),_w(),zo(6),ab(`ngModel`,n.email.from_name),_w(),zo(16),ab(`ngModel`,n.email.smtp_host),_w(),zo(4),ab(`ngModel`,n.email.smtp_port),_w(),zo(5),ab(`ngModel`,n.email.username),_w(),zo(4),ab(`ngModel`,n.email.password),_w(),zo(10),ab(`ngModel`,n.storage.max_size_mb),_w(),zo(4),ab(`ngModel`,n.storage.retention_days),_w(),zo(2),Pg(`disabled`,e.busy()||!e.dirty()),zo(3),Pg(`disabled`,e.busy()||e.dirty()),zo(2),Pg(`disabled`,e.busy()||e.dirty()),zo(2),Pg(`disabled`,e.busy()||e.dirty()),zo(2),Ko(e.dirty()?161:-1),zo(),Ko(e.busy()?162:-1),zo(),Ko((t=e.dry())?163:-1,t)}}var X=c=>c.join(`
`);var G=c=>c.split(/[\n,;]+/).map(o=>o.trim()).filter(Boolean);var lt=class c{api=m(_y);snack=m(Bt);f=Xe(null);problems=Xe([]);warnings=Xe([]);error=Xe(``);busy=Xe(!1);dry=Xe(null);version=Xe(0);saved=``;dirty=FC(()=>{this.version();let o=this.f();return!!o&&JSON.stringify(o)!==this.saved});constructor(){this.load()}touch(){this.version.update(o=>o+1)}setForm(o,t,n=[]){let g=o,{template:e}=g,l=pv(g,[`template`]),v=re(R$1({},structuredClone(l)),{lists:{senders:X(o.mailbox.allowed_senders),forwarders:X(o.mailbox.allowed_forwarders),to:X(o.email.to)}});this.f.set(v),this.saved=JSON.stringify(v),this.problems.set(t),this.warnings.set(n),this.touch()}async load(){try{let o=await this.api.config();this.setForm(o.config,o.problems,o.warnings)}catch(o){this.error.set(t$(o))}}async save(){let o=this.f();if(o){this.busy.set(!0);try{let t=await this.api.saveConfig({features:o.features,mailbox:re(R$1({},o.mailbox),{allowed_senders:G(o.lists.senders),allowed_forwarders:G(o.lists.forwarders)}),email:re(R$1({},o.email),{to:G(o.lists.to)}),storage:o.storage});this.setForm(t.config,t.problems,t.warnings),await this.api.loadMeta(),this.snack.open(t.problems.length?`Saved. The worker is not running yet: see above.`:`Saved. Mail worker restarted.`,`OK`,{duration:4e3})}catch(t){this.snack.open(t$(t),`OK`)}finally{this.busy.set(!1)}}}async run(o,t){this.busy.set(!0);try{this.snack.open(t(await o()),`OK`,{duration:6e3})}catch(n){this.snack.open(t$(n),`OK`)}finally{this.busy.set(!1)}}testMailbox(){return this.run(()=>this.api.testMailbox(),o=>`Mailbox OK${o.gmail?` (Gmail)`:``}: ${o.waiting} unprocessed order email(s)`)}testEmail(){return this.run(()=>this.api.testEmail(),o=>`Test email sent to ${o.to.join(`, `)}`)}dryRun(){return this.dry.set(null),this.run(()=>this.api.dryRun(),o=>(this.dry.set(o),`Dry run: ${o.previews.length} message(s) would be sent`))}static ɵfac=function(t){return new(t||c)};static ɵcmp=ot({type:c,selectors:[[`app-settings`]],decls:4,vars:2,consts:[[1,`error`],[1,`problems`],[1,`warnings`],[3,`ngModelChange`,`change`,`ngModel`],[1,`hint`],[1,`row`],[`appearance`,`outline`],[`matInput`,``,`autocomplete`,`off`,3,`ngModelChange`,`input`,`ngModel`],[`matInput`,``,`type`,`password`,`autocomplete`,`new-password`,3,`ngModelChange`,`input`,`ngModel`],[`matInput`,``,`type`,`number`,`min`,`15`,3,`ngModelChange`,`input`,`ngModel`],[`matInput`,``,`type`,`number`,`min`,`1`,3,`ngModelChange`,`input`,`ngModel`],[`matInput`,``,`rows`,`2`,3,`ngModelChange`,`input`,`ngModel`],[1,`adv`],[`matInput`,``,3,`ngModelChange`,`input`,`ngModel`],[`matInput`,``,`type`,`number`,3,`ngModelChange`,`input`,`ngModel`],[`appearance`,`outline`,1,`wide`],[1,`actions`,`sticky`],[`mat-flat-button`,``,3,`click`,`disabled`],[`svgIcon`,`save`],[`mat-stroked-button`,``,3,`click`,`disabled`],[`mode`,`indeterminate`]],template:function(t,n){if(t&1&&(ea(0,`h2`),hC(1,`Settings`),od(),Yo(2,ct,2,1,`p`,0),Yo(3,wt,164,33)),t&2){let e;zo(2),Ko(n.error()?2:-1),zo(),Ko((e=n.f())?3:-1,e)}},dependencies:[Dn,Te,zt$1,vn,bt$1,qt,j$1,_,k,T,A$1,$n,Xe$1,de,se$1,Pe,Be,at,j,y3,b3,Mt,wt$1,Wt,j$2,L,gn,Ie$1,Te$1,mn$1],styles:[`mat-card[_ngcontent-%COMP%]{margin-bottom:16px}.row[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}.row[_ngcontent-%COMP%]   mat-form-field[_ngcontent-%COMP%]{flex:1 1 220px}.row[_ngcontent-%COMP%]   .wide[_ngcontent-%COMP%]{flex:2 1 300px}.hint[_ngcontent-%COMP%]{color:var(--%NS%mat-sys-on-surface-variant);font-size:13px}.adv[_ngcontent-%COMP%]{margin-top:12px;box-shadow:none;border:1px solid var(--%NS%mat-sys-outline-variant)}.actions[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 0}.sticky[_ngcontent-%COMP%]{position:sticky;bottom:0;background:var(--%NS%mat-sys-surface);z-index:1}.problems[_ngcontent-%COMP%]{background:var(--%NS%mat-sys-error-container);color:var(--%NS%mat-sys-on-error-container)}.warnings[_ngcontent-%COMP%]{background:#fff8e1;color:#5d4300}.error[_ngcontent-%COMP%]{color:var(--%NS%mat-sys-error)}pre[_ngcontent-%COMP%]{white-space:pre-wrap;word-break:break-word;background:var(--%NS%mat-sys-surface-container);padding:12px;border-radius:6px}`]})};export{lt as SettingsPage};