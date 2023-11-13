import { marked } from 'marked';
import { mangle } from "marked-mangle";

marked.use(mangle());
marked.use({headerIds: false})


export default marked