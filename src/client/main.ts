import { App } from "./core/App.js";
import { DomRegistry } from "./core/DomRegistry.js";

const elements = new DomRegistry().bootstrap();
new App(elements).start();
