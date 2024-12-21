import { storeViewByName } from "./renderer";
import Hello from "./view/Hello";

export default function initViews() {
    storeViewByName('hello', Hello);
}