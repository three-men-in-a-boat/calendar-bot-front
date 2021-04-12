import {Scenes} from 'telegraf'
import CustomContext from "../Models/CustomContext";
import CreateEventScene from "./create_event";

const stage = new Scenes.Stage<CustomContext>([CreateEventScene]);

export default stage;

