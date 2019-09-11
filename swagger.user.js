// ==UserScript==
// @name         swagger
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      *://*/swagger-ui.html
// @grant        none
// ==/UserScript==

(function () {
    var swagger = {
        init() {
            Vue.component("ui-menu", {
                props: { resources: {} },
                template: `
                    <div id="uiMenu" class="ui-menu">
                        <div class="ui-menu-set-form">
                            <!--<div class="ui-menu-set-form-title">一键设置</div>-->
                            <div class="ui-menu-set-form-body">
                                <div class="ui-menu-set-key">
                                    <input  v-model="key" placeholder="请输入key" required/>
                                </div>
                                <div class="ui-menu-set-value">
                                    <input  v-model="value" placeholder="请输入value"/>
                                </div>
                                <button class="ui-menu-set-submit" type="submit"@click="setValue">
                                    设置
                                    <span class="ui-menu-set-history">
                                        <span>🔻</span>
                                        <div class="ui-menu-set-mores">
                                            <div class="ui-menu-set-more" v-for="(v,i) in values" @click.stop="setKV(v)">
                                                <div class="ui-menu-set-more-text">
                                                    <span v-text="v[0]"></span>
                                                    <span v-text="':'"></span>
                                                    <span v-text="v[1]"></span>
                                                </div>
                                                <div class="ui-menu-set-more-delete" @click.stop="delKV(i)">❌</div>
                                            </div>
                                        </div>
                                    </span>
                                </button>
                            </div>
                        </div>
                        <ul class="ui-menu-ul">
                            <li class="ui-menu-resources" v-for="resource in resources">
                                <div class="ui-menu-resource" :class="{active:activeResource==resource.dataId}" @click="showResource(resource)">
                                    <span v-text="resource.name"></span>
                                </div>
                                <ul class="ui-menu-endpoints" v-for="endpoint in resource.endpoints">
                                    <div class="ui-menu-endpoint" :class="{active:activeEndpoint==endpoint.dataId}" @click="showEndpoint(resource,endpoint)" :title="endpoint.path">
                                        <span class="copy" @click="copy(endpoint)">📂</span>
                                        <span v-text="endpoint.name"></span>
                                        <!--<span v-text="endpoint.path"></span>-->
                                        <span v-text="endpoint.method"></span>
                                    </div>
                                </ul>
                            </li>
                        </ul>
                    </div>
                `,
                data() {
                    return {
                        activeResource: "",
                        activeEndpoint: "",
                        key: "",
                        value: "",
                        values: [],
                    }
                },
                created() {
                    this.values = this.getItem();
                    if (this.values.length > 0) {
                        let obj = this.values[0];
                        if (obj[0]) {
                            this.key = obj[0];
                            this.value = obj[1];
                            this.setValue(false);
                        }
                    }
                },
                mounted() {
                    let obj = JSON.parse(localStorage.getItem("SwaggerResourceEndpointId")) || [];
                    if (obj.length > 0) {
                        this.activeResource = obj[0];
                        this.activeEndpoint = obj[1];
                        this.showEndpoint({ dataId: obj[0] }, { dataId: obj[1] });
                    }
                },
                methods: {
                    showResource(resource, flag) {
                        this.activeResource = resource.dataId;
                        $("#" + resource.dataId).show(200);
                        if (flag) return;
                        setTimeout(() => {
                            document.querySelector("#" + resource.dataId).scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                        }, 200);
                    },
                    showEndpoint(resource, endpoint) {
                        this.activeEndpoint = endpoint.dataId;
                        this.showResource(resource, true);
                        $("#" + endpoint.dataId + "_content").show(200);
                        localStorage.setItem("SwaggerResourceEndpointId", JSON.stringify([resource.dataId, endpoint.dataId]));
                        setTimeout(() => {
                            document.querySelector("#" + endpoint.dataId).scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                        }, 300);
                    },
                    copy(endpoint) {
                        var input = document.createElement('input');
                        input.setAttribute('readonly', 'readonly');
                        input.setAttribute('value', endpoint.path);
                        document.body.appendChild(input);
                        input.select();
                        if (document.execCommand('Copy')) {
                            //console.log("复制成功");
                        }
                        document.body.removeChild(input);
                    },
                    setValue(save) {
                        if (this.key == "") return alert("key不能为空！");
                        let inputs;
                        try {
                            inputs = document.querySelectorAll("input[name=" + this.key + "]");
                        } catch (error) {
                            alert(error)
                        }
                        inputs.forEach(input => {
                            input.value = this.value;
                        });
                        if (save) {
                            let index = this.values.findIndex(v => v[0] == this.key && v[1] == this.value);
                            if (index >= 0) {
                                this.values.splice(index, 1);
                            }
                            this.values.unshift([this.key, this.value]);
                            this.setItem(this.values);
                        }
                    },
                    setKV(v) {
                        this.key = v[0];
                        this.value = v[1];
                    },
                    delKV(index) {
                        this.values.splice(index, 1);
                        this.setItem(this.values);
                    },

                    getItem() {
                        return JSON.parse(localStorage.getItem("SwaggerItem")) || [];
                    },
                    setItem(values) {
                        localStorage.setItem("SwaggerItem", JSON.stringify(values));
                    }
                }
            });
            let loadSelectInterval = setInterval(() => {
                var select = document.querySelector("#select_baseUrl");
                if (select && select.childNodes.length > 0) {
                    clearInterval(loadSelectInterval);
                    select.addEventListener("change", swagger.chenageSelect);
                    var value = localStorage.getItem("SwaggerBaseUrl");
                    if (value) {
                        select.value = value;
                    }
                    select.dispatchEvent(new Event('change'));
                }
            });
        },
        chenageSelect(e) {
            var time = 0;
            var interval = setInterval(() => {
                time++;
                var fail = document.querySelector(".message-fail");
                if (fail || time > 10 * 30) {
                    clearInterval(interval);
                } else {
                    if (e) {
                        localStorage.setItem("SwaggerBaseUrl", e.target.value);
                    }
                    var resources = document.querySelectorAll(".resource");
                    if (resources && resources.length > 0) {
                        clearInterval(interval);
                        swagger.createMenu();
                    }
                }
            }, 100);
        },
        createMenu() {
            var fragment = new DocumentFragment();
            var resources = [];
            var dom = document.querySelector("#resources");
            fragment.append(dom.cloneNode(true));
            var domResources = fragment.querySelectorAll(".resource");
            domResources.forEach((resource) => {
                var resourceA = resource.querySelector(".toggleEndpointList");
                var endpoints = [];
                var domEndpoints = resource.querySelectorAll(".endpoint");
                domEndpoints.forEach((endpoint) => {
                    var endpointOperation = endpoint.querySelector(".operation");
                    var endpointMethodA = endpoint.querySelector(".http_method>a");
                    var endpointPathA = endpoint.querySelector(".path>a");
                    var endpointNameA = endpoint.querySelector(".options>li>a");
                    endpoints.push({ name: endpointNameA.innerText, dataId: endpointOperation.getAttribute("id"), href: endpointNameA.getAttribute("href"), method: endpointMethodA.innerText, path: endpointPathA.innerText });
                });
                resources.push({ name: resourceA.innerText, dataId: resourceA.getAttribute("data-id") + "_endpoint_list", href: resourceA.getAttribute("href"), endpoints });
            });

            var UiMenu = Vue.extend({
                template: `<ui-menu :resources="resources"></ui-menu>`,
                data() {
                    return {
                        resources
                    }
                }
            });
            var uiMenuDom = document.querySelector("#uiMenu");
            var container = document.querySelector("#swagger-ui-container");
            if (uiMenuDom) {
                container.removeChild(uiMenuDom);
            }
            container.appendChild(new UiMenu().$mount().$el);
        },
        load() {
            var style = document.createElement("style");
            var textNode = document.createTextNode(`
                #logo {
                    display: none;
                }
                #header{
                    position: fixed;
                    width: 100%;
                    top: 0;
                    left:0;
                }
                #message-bar{
                    margin-top: 52px;
                }
                .toggleOperation{
                    color: red;
                }
                .swagger-section .swagger-ui-wrap {
                    padding-left: 300px;
                }
                .ui-menu {
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    width: 300px;
                    height: 100%;
                    top: 0;
                    left: 50%;
                    margin-left: -630px;
                    overflow: hidden;
                }
                .ui-menu-set-form {
                    display: flex;
                    height: 52px;
                    flex-direction: column;
                    justify-content: center;
                }
                .ui-menu-set-form .ui-menu-set-form-title{
                    font-size: 14px;
                    color: #000;
                    margin-bottom: 5px;
                }
                .ui-menu-set-form .ui-menu-set-form-body{
                    display: flex;
                    align-items: center;
                }
                .ui-menu-set-form .ui-menu-set-form-body .ui-menu-set-key{
                    flex: 1;
                    padding-right: 12px;
                }
                .ui-menu-set-form .ui-menu-set-form-body .ui-menu-set-key input{
                    width: 100%;
                }
                .ui-menu-set-form .ui-menu-set-form-body .ui-menu-set-value{
                    flex: 2;
                    padding-right: 12px;
                }
                .ui-menu-set-form .ui-menu-set-form-body .ui-menu-set-value input{
                    width: 100%;
                }
                .ui-menu-set-form .ui-menu-set-form-body .ui-menu-set-submit{
                    width: 60px;
                    white-space: nowrap;
                    cursor: pointer;
                }
                .ui-menu-set-history {
                    position: relative;
                }
                .ui-menu-set-mores {
                    position: absolute;
                    width: 300px;
                    height:300px;
                    max-height: 0;
                    top: 20px;
                    right: 0;
                    overflow: auto;
                    transition: max-height linear 0.3s;
                    background: #eee
                }
                .ui-menu-set-history:hover .ui-menu-set-mores{
                    max-height: 300px;
                }
                .ui-menu-set-more {
                    display: flex;
                    align-items: center;
                    padding: 5px 5px 5px 10px;
                    text-align: left;
                    white-space: pre-wrap;
                }
                .ui-menu-set-more span {
                    word-break: break-all;
                }
                .ui-menu-set-more-text{
                    flex: 1;
                    color: #333;
                }
                .ui-menu-set-more-text:hover{
                    color: #000;
                }
                .ui-menu-set-more-delete{

                }
                .ui-menu-ul {
                    flex: 1;
                    padding-top: 10px;
                    overflow: auto;
                    cursor: pointer;
                    box-sizing: border-box;
                }
                .ui-menu .ui-menu-resources {
                    padding: 5px 0;
                }
                .ui-menu .ui-menu-resources .ui-menu-resource {
                    margin-bottom: 10px;
                    font-size: 16px;
                    color: #666;
                    font-weight: bold;
                }
                .ui-menu .ui-menu-resources .ui-menu-resource.active {
                    color: red !important;
                }
                .ui-menu .ui-menu-resources .ui-menu-resource:hover {
                    color: #000;
                }
                .ui-menu .ui-menu-resource .ui-menu-resource span {
                    margin-right: 10px;
                }
                .ui-menu .ui-menu-endpoints {
                    padding: 0;
                }
                .ui-menu .ui-menu-endpoints .ui-menu-endpoint {
                    overflow: auto;
                    font-size: 14px;
                    color: #666;
                    padding: 3px 0;
                    white-space: nowrap;
                }
                .ui-menu .ui-menu-endpoints .ui-menu-endpoint.active {
                    color: red !important;
                }
                .ui-menu .ui-menu-endpoints .ui-menu-endpoint:hover {
                    color: #000;
                }
                .ui-menu .ui-menu-endpoints .ui-menu-endpoint span {
                    margin-right: 10px;
                }
                .ui-menu .ui-menu-endpoints .ui-menu-endpoint span.copy {
                    margin-right: 0;
                }
            `);
            style.type = "text/css";
            style.appendChild(textNode);
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/vue";
            document.head.append(style);
            document.head.append(script);

            var loadVueInterval = setInterval(() => {
                if (window.Vue) {
                    clearInterval(loadVueInterval);
                    swagger.init();
                }
            }, 10);
        }
    };

    swagger.load();
})();
