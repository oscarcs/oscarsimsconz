import { storeViewByName } from "./renderer";
import Landing from "./view/Landing";
import Post from "./view/Post";

export default function initViews() {
    storeViewByName('landing', Landing);
    storeViewByName('post', Post);
}