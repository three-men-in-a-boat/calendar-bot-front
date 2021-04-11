import {Scenes} from 'telegraf'
import CustomContext from "../Models/CustomContext";
import CreateEventScene from "./create_event";
import FindTimeScene from "./find_time";

const stage = new Scenes.Stage<CustomContext>([CreateEventScene, FindTimeScene]);

export default stage;

