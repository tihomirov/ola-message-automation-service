import{$n as rb,A as AI,Bn as od,Ct as R$1,Dn as jt,Dt as Se,Et as Sb,Fn as na,Gt as Xo,H as GI,Hn as ov,J as Hd,Jn as qI,K as HI,Kn as pv,L as Ew,Ln as ns,Mn as m,N as Bg,Nn as mC,P as Bz,Pn as mn,Qt as Zo,Sr as zo,St as Qr,Ut as Xe,Vn as ot$1,W as Gg,X as Ie,Xn as qd,Y as Hg,Yn as qa,Yt as Z,Z as Ip,_ as zt$1,_n as g3,_r as yb,_t as Pp,bn as ib,c as Te,cn as cb,cr as v,ct as MI,d as bt,dr as vw,er as rd,fn as e$,ft as NI,g as vn,gt as Pg,h as se,hr as xI,ht as PI,it as Lg,lr as vC,n as wt,on as b3,ot as Lt,p as qt,pn as eS,pr as wp,pt as OC,qt as Yo,r as Dn,rn as ab,rt as Ko,s as R,t as Mt,tn as _y,tr as re,tt as Js,un as db,ur as ve,vn as ge,wr as zt,yr as zI}from"./main-KGXAWROY.js";import{n as j$1,t as L}from"./chunk-BCDxCscB.js";import"./chunk-C1BlX_EZ.js";import{n as Wt,t as Bt}from"./chunk-DBk8HMl2.js";import{l as se$1,o as de,r as Xe$1,s as fn,t as $n}from"./chunk-Bv48isNz.js";import{n as Pe,t as Be}from"./chunk-COFYfoYh.js";import{a as k,i as j$2,n as T,r as _,t as A}from"./chunk-Coxc8vkd.js";import{a as mn$1,i as gn,n as Te$1,t as Ie$1}from"./chunk-CeO_-VIY.js";var nt=(()=>{class c{labelPosition=`after`;static ɵfac=function(n){return new(n||c)};static ɵcmp=(function(){return ot$1({type:c,selectors:[[``,`mat-internal-form-field`,``]],hostAttrs:[1,`mdc-form-field`,`mat-internal-form-field`],hostVars:2,hostBindings:function(e,i){e&2&&mn(`mdc-form-field--align-end`,i.labelPosition===`before`)},inputs:{labelPosition:`labelPosition`},ngContentSelectors:[`*`],decls:1,vars:0,template:function(e,i){e&1&&(Xo(),Lt(0))},styles:[`.mat-internal-form-field {
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
`],encapsulation:2})})()}return c})();var ot=new v(`mat-slide-toggle-default-options`,{providedIn:`root`,factory:()=>({disableToggleValue:!1,hideIcon:!1,disabledInteractive:!1})});var B=class{source;checked;constructor(d,t){this.source=d,this.checked=t}};var q=(()=>{class c{_elementRef=m(ge);_focusMonitor=m(Hd);_changeDetectorRef=m(eS);defaults=m(ot);_injector=m(Z);_signalFormField=null;_onChange=t=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=!1;_createChangeEvent(t){return new B(this,t)}_labelId;get buttonId(){return`${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus()}_noopAnimations=Qr();_focused=!1;name=null;id;labelPosition=`after`;ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=!1;color;disabled=!1;fullWidth=!1;disableRipple=!1;tabIndex=0;get checked(){return this._checked}set checked(t){this._checked=t,this._changeDetectorRef.markForCheck()}hideIcon;disabledInteractive;change=new Ie;toggleChange=new Ie;get inputId(){return`${this.id||this._uniqueId}-input`}constructor(){m(zt).load(ov);let t=m(new yb(`tabindex`),{optional:!0}),n=this.defaults;this.tabIndex=t==null?0:parseInt(t)||0,this.color=n.color||`accent`,this.id=this._uniqueId=m(qd).getId(`mat-mdc-slide-toggle-`),this.hideIcon=n.hideIcon??!1,this.disabledInteractive=n.disabledInteractive??!1,this._labelId=this._uniqueId+`-label`}ngOnInit(){this._signalFormField=this._injector.get(fn,void 0,{optional:!0,self:!0})}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,!0).subscribe(t=>{t===`keyboard`||t===`program`?(this._focused=!0,this._changeDetectorRef.markForCheck()):t||Promise.resolve().then(()=>{this._focused=!1,this._onTouched(),this._changeDetectorRef.markForCheck()})})}ngOnChanges(t){t.required&&this._validatorOnChange()}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef)}writeValue(t){this.checked=!!t}registerOnChange(t){this._onChange=t}registerOnTouched(t){this._onTouched=t}validate(t){return this.required&&t.value!==!0&&!this._signalFormField?{required:!0}:null}registerOnValidatorChange(t){this._validatorOnChange=t}setDisabledState(t){this.disabled=t,this._changeDetectorRef.markForCheck()}toggle(){this.checked=!this.checked,this._onChange(this.checked)}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked))}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new B(this,this.checked))))}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static ɵfac=function(n){return new(n||c)};static ɵcmp=(function(){let t=[`switch`],n=[`*`];function e(i,v){i&1&&(Js(0,`span`,11),Pp(),Js(1,`svg`,13),Lg(2,`path`,14),rd(),Js(3,`svg`,15),Lg(4,`path`,16),rd()())}return ot$1({type:c,selectors:[[`mat-slide-toggle`]],viewQuery:function(v,g){if(v&1&&Gg(t,5),v&2){let P;zI(P=GI())&&(g._switchElement=P.first)}},hostAttrs:[1,`mat-mdc-slide-toggle`],hostVars:15,hostBindings:function(v,g){v&2&&(Bg(`id`,g.id),Zo(`tabindex`,null)(`aria-label`,null)(`name`,null)(`aria-labelledby`,null),od(g.color?`mat-`+g.color:``),mn(`mat-mdc-slide-toggle-focused`,g._focused)(`mat-mdc-slide-toggle-checked`,g.checked)(`mat-slide-toggle-full-width`,g.fullWidth)(`_mat-animation-noopable`,g._noopAnimations))},inputs:{name:`name`,id:`id`,labelPosition:`labelPosition`,ariaLabel:[0,`aria-label`,`ariaLabel`],ariaLabelledby:[0,`aria-labelledby`,`ariaLabelledby`],ariaDescribedby:[0,`aria-describedby`,`ariaDescribedby`],required:[2,`required`,`required`,jt],color:`color`,disabled:[2,`disabled`,`disabled`,jt],fullWidth:[2,`fullWidth`,`fullWidth`,jt],disableRipple:[2,`disableRipple`,`disableRipple`,jt],tabIndex:[2,`tabIndex`,`tabIndex`,i=>i==null?0:Sb(i)],checked:[2,`checked`,`checked`,jt],hideIcon:[2,`hideIcon`,`hideIcon`,jt],disabledInteractive:[2,`disabledInteractive`,`disabledInteractive`,jt]},outputs:{change:`change`,toggleChange:`toggleChange`},exportAs:[`matSlideToggle`],features:[db([{provide:se,useExisting:ns(()=>c),multi:!0},{provide:R,useExisting:c,multi:!0}]),na],ngContentSelectors:n,decls:14,vars:27,consts:[[`switch`,``],[`mat-internal-form-field`,``,3,`labelPosition`],[`role`,`switch`,`type`,`button`,1,`mdc-switch`,3,`click`,`tabIndex`,`disabled`],[1,`mat-mdc-slide-toggle-touch-target`],[1,`mdc-switch__track`],[1,`mdc-switch__handle-track`],[1,`mdc-switch__handle`],[1,`mdc-switch__shadow`],[1,`mdc-elevation-overlay`],[1,`mdc-switch__ripple`],[`mat-ripple`,``,1,`mat-mdc-slide-toggle-ripple`,`mat-focus-indicator`,3,`matRippleTrigger`,`matRippleDisabled`,`matRippleCentered`],[1,`mdc-switch__icons`],[1,`mdc-label`,3,`click`,`for`],[`viewBox`,`0 0 24 24`,`aria-hidden`,`true`,1,`mdc-switch__icon`,`mdc-switch__icon--on`],[`d`,`M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z`],[`viewBox`,`0 0 24 24`,`aria-hidden`,`true`,1,`mdc-switch__icon`,`mdc-switch__icon--off`],[`d`,`M20 13H4v-2h16v2z`]],template:function(v,g){if(v&1&&(Xo(),Js(0,`div`,1)(1,`button`,2,0),Hg(`click`,function(){return g._handleClick()}),Lg(3,`div`,3)(4,`span`,4),Js(5,`span`,5)(6,`span`,6)(7,`span`,7),Lg(8,`span`,8),rd(),Js(9,`span`,9),Lg(10,`span`,10),rd(),Yo(11,e,5,0,`span`,11),rd()()(),Js(12,`label`,12),Hg(`click`,function(lt){return lt.stopPropagation()}),Lt(13),rd()()),v&2){let P=qI(2);Pg(`labelPosition`,g.labelPosition),zo(),mn(`mdc-switch--selected`,g.checked)(`mdc-switch--unselected`,!g.checked)(`mdc-switch--checked`,g.checked)(`mdc-switch--disabled`,g.disabled)(`mat-mdc-slide-toggle-disabled-interactive`,g.disabledInteractive),Pg(`tabIndex`,g.disabled&&!g.disabledInteractive?-1:g.tabIndex)(`disabled`,g.disabled&&!g.disabledInteractive),Zo(`id`,g.buttonId)(`name`,g.name)(`aria-label`,g.ariaLabel)(`aria-labelledby`,g._getAriaLabelledBy())(`aria-describedby`,g.ariaDescribedby)(`aria-required`,g.required||null)(`aria-checked`,g.checked)(`aria-disabled`,g.disabled&&g.disabledInteractive?`true`:null),zo(9),Pg(`matRippleTrigger`,P)(`matRippleDisabled`,g.disableRipple||g.disabled)(`matRippleCentered`,!0),zo(),Ko(g.hideIcon?-1:11),zo(),Pg(`for`,g.buttonId),Zo(`id`,g._labelId)}},dependencies:[Bz,nt],styles:[`.mdc-switch {
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
`],encapsulation:2})})()}return c})();var it=(()=>{class c{static ɵfac=function(n){return new(n||c)};static ɵmod=Se({type:c});static ɵinj=ve({imports:[q,qa]})}return c})();function dt(c,d){if(c&1&&(Js(0,`p`,0),mC(1),rd()),c&2){let t=HI();zo(),rb(t.error())}}function ct(c,d){if(c&1&&(Js(0,`li`),mC(1),rd()),c&2){let t=d.$implicit;zo(),rb(t)}}function mt(c,d){if(c&1&&(Js(0,`mat-card`,1)(1,`mat-card-content`)(2,`strong`),mC(3,`The mail worker is not running:`),rd(),Js(4,`ul`),MI(5,ct,2,1,`li`,null,NI),rd()()()),c&2){let t=HI(2);zo(5),AI(t.problems())}}function gt(c,d){c&1&&(Js(0,`span`,3),mC(1,`Save first to test`),rd())}function ht(c,d){c&1&&Lg(0,`mat-progress-bar`,19)}function _t(c,d){if(c&1&&(Js(0,`h4`),mC(1),rd(),Js(2,`pre`),mC(3),rd()),c&2){let t=d.$implicit;zo(),rb(t.subject),zo(2),rb(t.text)}}function pt(c,d){if(c&1&&(Js(0,`mat-card`)(1,`mat-card-header`)(2,`mat-card-title`),mC(3,`Dry run: what the next poll would send`),rd()(),Js(4,`mat-card-content`)(5,`p`),mC(6),rd(),MI(7,_t,4,2,null,null,xI),rd()()),c&2){let t=d;zo(6),ib(`Found `,t.found,` email(s): `,t.previews.length,` new order(s), `,t.duplicates,` already sent, `,t.ignored,` not an order. Nothing was sent or labelled.`),zo(),AI(t.previews)}}function ut(c,d){if(c&1){let t=PI();Yo(0,mt,7,0,`mat-card`,1),Js(1,`mat-card`)(2,`mat-card-header`)(3,`mat-card-title`),mC(4,`Flow`),rd()(),Js(5,`mat-card-content`)(6,`mat-slide-toggle`,2),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.features.fetch_order_details,e)||(i.features.fetch_order_details=e),Ip(e)}),Hg(`change`,function(){wp(t);let e=HI();return Ip(e.touch())}),mC(7,` Fetch order details from the shop (flow 2) `),rd(),Js(8,`p`,3),mC(9,` Off (flow 1): the message is built from the order email only, without sizes. On (flow 2): the service also logs in to the shop admin and adds sizes. Configure it on the `),Js(10,`b`),mC(11,`Shop`),rd(),mC(12,` page, which appears after saving. `),rd()()(),Js(13,`mat-card`)(14,`mat-card-header`)(15,`mat-card-title`),mC(16,`Mailbox (order emails)`),rd()(),Js(17,`mat-card-content`)(18,`mat-slide-toggle`,2),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.mailbox.enabled,e)||(i.mailbox.enabled=e),Ip(e)}),Hg(`change`,function(){wp(t);let e=HI();return Ip(e.touch())}),mC(19,`Poll the mailbox`),rd(),Js(20,`div`,4)(21,`mat-form-field`,5)(22,`mat-label`),mC(23,`Gmail address`),rd(),Js(24,`input`,6),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.mailbox.username,e)||(i.mailbox.username=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()(),Js(25,`mat-form-field`,5)(26,`mat-label`),mC(27,`App password`),rd(),Js(28,`input`,7),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.mailbox.password,e)||(i.mailbox.password=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd(),Js(29,`mat-hint`),mC(30,`Leave as is to keep the saved one`),rd()()(),Js(31,`div`,4)(32,`mat-form-field`,5)(33,`mat-label`),mC(34,`Check every (seconds)`),rd(),Js(35,`input`,8),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.mailbox.poll_interval_seconds,e)||(i.mailbox.poll_interval_seconds=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()(),Js(36,`mat-form-field`,5)(37,`mat-label`),mC(38,`Look back (days)`),rd(),Js(39,`input`,9),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.mailbox.lookback_days,e)||(i.mailbox.lookback_days=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd(),Js(40,`mat-hint`),mC(41,`Also the catch-up window after downtime`),rd()(),Js(42,`mat-form-field`,5)(43,`mat-label`),mC(44,`Send attempts before "failed"`),rd(),Js(45,`input`,9),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.mailbox.max_attempts,e)||(i.mailbox.max_attempts=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()()(),Js(46,`div`,4)(47,`mat-form-field`,5)(48,`mat-label`),mC(49,`Shop sender(s)`),rd(),Js(50,`textarea`,10),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.lists.senders,e)||(i.lists.senders=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd(),Js(51,`mat-hint`),mC(52,`One per line`),rd()(),Js(53,`mat-form-field`,5)(54,`mat-label`),mC(55,`Accept manual "Fwd:" from`),rd(),Js(56,`textarea`,10),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.lists.forwarders,e)||(i.lists.forwarders=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd(),Js(57,`mat-hint`),mC(58,`Optional, one per line`),rd()()(),Js(59,`mat-expansion-panel`,11)(60,`mat-expansion-panel-header`)(61,`mat-panel-title`),mC(62,`Advanced`),rd()(),Js(63,`div`,4)(64,`mat-form-field`,5)(65,`mat-label`),mC(66,`IMAP host`),rd(),Js(67,`input`,12),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.mailbox.host,e)||(i.mailbox.host=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()(),Js(68,`mat-form-field`,5)(69,`mat-label`),mC(70,`Port`),rd(),Js(71,`input`,13),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.mailbox.port,e)||(i.mailbox.port=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()(),Js(72,`mat-form-field`,5)(73,`mat-label`),mC(74,`Folder`),rd(),Js(75,`input`,12),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.mailbox.folder,e)||(i.mailbox.folder=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()()(),Js(76,`div`,4)(77,`mat-form-field`,5)(78,`mat-label`),mC(79,`Processed label`),rd(),Js(80,`input`,12),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.mailbox.processed_label,e)||(i.mailbox.processed_label=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()(),Js(81,`mat-form-field`,5)(82,`mat-label`),mC(83,`Ignored label`),rd(),Js(84,`input`,12),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.mailbox.ignored_label,e)||(i.mailbox.ignored_label=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()(),Js(85,`mat-form-field`,5)(86,`mat-label`),mC(87,`Failed label`),rd(),Js(88,`input`,12),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.mailbox.failed_label,e)||(i.mailbox.failed_label=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()()()()()(),Js(89,`mat-card`)(90,`mat-card-header`)(91,`mat-card-title`),mC(92,`Email notifications`),rd()(),Js(93,`mat-card-content`)(94,`mat-slide-toggle`,2),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.email.enabled,e)||(i.email.enabled=e),Ip(e)}),Hg(`change`,function(){wp(t);let e=HI();return Ip(e.touch())}),mC(95,`Send notifications by email`),rd(),Js(96,`div`,4)(97,`mat-form-field`,14)(98,`mat-label`),mC(99,`Send to`),rd(),Js(100,`textarea`,10),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.lists.to,e)||(i.lists.to=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd(),Js(101,`mat-hint`),mC(102,`One address per line`),rd()(),Js(103,`mat-form-field`,5)(104,`mat-label`),mC(105,`Sender name`),rd(),Js(106,`input`,12),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.email.from_name,e)||(i.email.from_name=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()()(),Js(107,`p`,3),mC(108,`The subject and message text are on the `),Js(109,`b`),mC(110,`Message`),rd(),mC(111,` page.`),rd(),Js(112,`mat-expansion-panel`,11)(113,`mat-expansion-panel-header`)(114,`mat-panel-title`),mC(115,`SMTP (advanced)`),rd()(),Js(116,`p`,3),mC(117,`Empty username/password = same as the mailbox account.`),rd(),Js(118,`div`,4)(119,`mat-form-field`,5)(120,`mat-label`),mC(121,`SMTP host`),rd(),Js(122,`input`,12),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.email.smtp_host,e)||(i.email.smtp_host=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()(),Js(123,`mat-form-field`,5)(124,`mat-label`),mC(125,`Port (587 STARTTLS / 465 SSL)`),rd(),Js(126,`input`,13),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.email.smtp_port,e)||(i.email.smtp_port=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()()(),Js(127,`div`,4)(128,`mat-form-field`,5)(129,`mat-label`),mC(130,`Username`),rd(),Js(131,`input`,6),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.email.username,e)||(i.email.username=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()(),Js(132,`mat-form-field`,5)(133,`mat-label`),mC(134,`Password`),rd(),Js(135,`input`,7),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.email.password,e)||(i.email.password=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()()()()()(),Js(136,`mat-card`)(137,`mat-card-header`)(138,`mat-card-title`),mC(139,`Storage`),rd()(),Js(140,`mat-card-content`)(141,`div`,4)(142,`mat-form-field`,5)(143,`mat-label`),mC(144,`Max DB size (MB)`),rd(),Js(145,`input`,9),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.storage.max_size_mb,e)||(i.storage.max_size_mb=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()(),Js(146,`mat-form-field`,5)(147,`mat-label`),mC(148,`Keep history (days)`),rd(),Js(149,`input`,9),vw(),cb(`ngModelChange`,function(e){let i=wp(t);return vC(i.storage.retention_days,e)||(i.storage.retention_days=e),Ip(e)}),Hg(`input`,function(){wp(t);let e=HI();return Ip(e.touch())}),rd()()()()(),Js(150,`div`,15)(151,`button`,16),Hg(`click`,function(){wp(t);let e=HI();return Ip(e.save())}),Lg(152,`mat-icon`,17),mC(153,` Save`),rd(),Js(154,`button`,18),Hg(`click`,function(){wp(t);let e=HI();return Ip(e.testMailbox())}),mC(155,`Test mailbox`),rd(),Js(156,`button`,18),Hg(`click`,function(){wp(t);let e=HI();return Ip(e.testEmail())}),mC(157,`Send test email`),rd(),Js(158,`button`,18),Hg(`click`,function(){wp(t);let e=HI();return Ip(e.dryRun())}),mC(159,`Dry run`),rd(),Yo(160,gt,2,0,`span`,3),rd(),Yo(161,ht,1,0,`mat-progress-bar`,19),Yo(162,pt,9,4,`mat-card`)}if(c&2){let t,n=d,e=HI();Ko(e.problems().length?0:-1),zo(6),ab(`ngModel`,n.features.fetch_order_details),Ew(),zo(12),ab(`ngModel`,n.mailbox.enabled),Ew(),zo(6),ab(`ngModel`,n.mailbox.username),Ew(),zo(4),ab(`ngModel`,n.mailbox.password),Ew(),zo(7),ab(`ngModel`,n.mailbox.poll_interval_seconds),Ew(),zo(4),ab(`ngModel`,n.mailbox.lookback_days),Ew(),zo(6),ab(`ngModel`,n.mailbox.max_attempts),Ew(),zo(5),ab(`ngModel`,n.lists.senders),Ew(),zo(6),ab(`ngModel`,n.lists.forwarders),Ew(),zo(11),ab(`ngModel`,n.mailbox.host),Ew(),zo(4),ab(`ngModel`,n.mailbox.port),Ew(),zo(4),ab(`ngModel`,n.mailbox.folder),Ew(),zo(5),ab(`ngModel`,n.mailbox.processed_label),Ew(),zo(4),ab(`ngModel`,n.mailbox.ignored_label),Ew(),zo(4),ab(`ngModel`,n.mailbox.failed_label),Ew(),zo(6),ab(`ngModel`,n.email.enabled),Ew(),zo(6),ab(`ngModel`,n.lists.to),Ew(),zo(6),ab(`ngModel`,n.email.from_name),Ew(),zo(16),ab(`ngModel`,n.email.smtp_host),Ew(),zo(4),ab(`ngModel`,n.email.smtp_port),Ew(),zo(5),ab(`ngModel`,n.email.username),Ew(),zo(4),ab(`ngModel`,n.email.password),Ew(),zo(10),ab(`ngModel`,n.storage.max_size_mb),Ew(),zo(4),ab(`ngModel`,n.storage.retention_days),Ew(),zo(2),Pg(`disabled`,e.busy()||!e.dirty()),zo(3),Pg(`disabled`,e.busy()||e.dirty()),zo(2),Pg(`disabled`,e.busy()||e.dirty()),zo(2),Pg(`disabled`,e.busy()||e.dirty()),zo(2),Ko(e.dirty()?160:-1),zo(),Ko(e.busy()?161:-1),zo(),Ko((t=e.dry())?162:-1,t)}}var j=c=>c.join(`
`);var X=c=>c.split(/[\n,;]+/).map(d=>d.trim()).filter(Boolean);var at=class c{api=m(_y);snack=m(Bt);f=Xe(null);problems=Xe([]);error=Xe(``);busy=Xe(!1);dry=Xe(null);version=Xe(0);saved=``;dirty=OC(()=>{this.version();let d=this.f();return!!d&&JSON.stringify(d)!==this.saved});constructor(){this.load()}touch(){this.version.update(d=>d+1)}setForm(d,t){let v=d,{template:n}=v,e=pv(v,[`template`]),i=re(R$1({},structuredClone(e)),{lists:{senders:j(d.mailbox.allowed_senders),forwarders:j(d.mailbox.allowed_forwarders),to:j(d.email.to)}});this.f.set(i),this.saved=JSON.stringify(i),this.problems.set(t),this.touch()}async load(){try{let d=await this.api.config();this.setForm(d.config,d.problems)}catch(d){this.error.set(e$(d))}}async save(){let d=this.f();if(d){this.busy.set(!0);try{let t=await this.api.saveConfig({features:d.features,mailbox:re(R$1({},d.mailbox),{allowed_senders:X(d.lists.senders),allowed_forwarders:X(d.lists.forwarders)}),email:re(R$1({},d.email),{to:X(d.lists.to)}),storage:d.storage});this.setForm(t.config,t.problems),await this.api.loadMeta(),this.snack.open(t.problems.length?`Saved. The worker is not running yet: see above.`:`Saved. Mail worker restarted.`,`OK`,{duration:4e3})}catch(t){this.snack.open(e$(t),`OK`)}finally{this.busy.set(!1)}}}async run(d,t){this.busy.set(!0);try{this.snack.open(t(await d()),`OK`,{duration:6e3})}catch(n){this.snack.open(e$(n),`OK`)}finally{this.busy.set(!1)}}testMailbox(){return this.run(()=>this.api.testMailbox(),d=>`Mailbox OK${d.gmail?` (Gmail)`:``}: ${d.waiting} unprocessed order email(s)`)}testEmail(){return this.run(()=>this.api.testEmail(),d=>`Test email sent to ${d.to.join(`, `)}`)}dryRun(){return this.dry.set(null),this.run(()=>this.api.dryRun(),d=>(this.dry.set(d),`Dry run: ${d.previews.length} message(s) would be sent`))}static ɵfac=function(t){return new(t||c)};static ɵcmp=ot$1({type:c,selectors:[[`app-settings`]],decls:4,vars:2,consts:[[1,`error`],[1,`problems`],[3,`ngModelChange`,`change`,`ngModel`],[1,`hint`],[1,`row`],[`appearance`,`outline`],[`matInput`,``,`autocomplete`,`off`,3,`ngModelChange`,`input`,`ngModel`],[`matInput`,``,`type`,`password`,`autocomplete`,`new-password`,3,`ngModelChange`,`input`,`ngModel`],[`matInput`,``,`type`,`number`,`min`,`15`,3,`ngModelChange`,`input`,`ngModel`],[`matInput`,``,`type`,`number`,`min`,`1`,3,`ngModelChange`,`input`,`ngModel`],[`matInput`,``,`rows`,`2`,3,`ngModelChange`,`input`,`ngModel`],[1,`adv`],[`matInput`,``,3,`ngModelChange`,`input`,`ngModel`],[`matInput`,``,`type`,`number`,3,`ngModelChange`,`input`,`ngModel`],[`appearance`,`outline`,1,`wide`],[1,`actions`,`sticky`],[`mat-flat-button`,``,3,`click`,`disabled`],[`svgIcon`,`save`],[`mat-stroked-button`,``,3,`click`,`disabled`],[`mode`,`indeterminate`]],template:function(t,n){if(t&1&&(Js(0,`h2`),mC(1,`Settings`),rd(),Yo(2,dt,2,1,`p`,0),Yo(3,ut,163,32)),t&2){let e;zo(2),Ko(n.error()?2:-1),zo(),Ko((e=n.f())?3:-1,e)}},dependencies:[Dn,Te,zt$1,vn,bt,qt,j$2,_,k,T,A,$n,Xe$1,de,se$1,Pe,Be,it,q,b3,g3,Mt,wt,Wt,j$1,L,gn,Ie$1,Te$1,mn$1],styles:[`mat-card[_ngcontent-%COMP%]{margin-bottom:16px}.row[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}.row[_ngcontent-%COMP%]   mat-form-field[_ngcontent-%COMP%]{flex:1 1 220px}.row[_ngcontent-%COMP%]   .wide[_ngcontent-%COMP%]{flex:2 1 300px}.hint[_ngcontent-%COMP%]{color:var(--%NS%mat-sys-on-surface-variant);font-size:13px}.adv[_ngcontent-%COMP%]{margin-top:12px;box-shadow:none;border:1px solid var(--%NS%mat-sys-outline-variant)}.actions[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 0}.sticky[_ngcontent-%COMP%]{position:sticky;bottom:0;background:var(--%NS%mat-sys-surface);z-index:1}.problems[_ngcontent-%COMP%]{background:var(--%NS%mat-sys-error-container);color:var(--%NS%mat-sys-on-error-container)}.error[_ngcontent-%COMP%]{color:var(--%NS%mat-sys-error)}pre[_ngcontent-%COMP%]{white-space:pre-wrap;word-break:break-word;background:var(--%NS%mat-sys-surface-container);padding:12px;border-radius:6px}`]})};export{at as SettingsPage};