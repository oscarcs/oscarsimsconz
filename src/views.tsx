import { storeViewByName } from "./renderer";
import Landing from "./view/Landing";

export default function initViews() {
    storeViewByName('landing', Landing);
}