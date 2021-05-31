import { examples } from "./examples";

export default examples.map((it) => {
  return {
    path: "/" + it.name,
    name: it.name,
  };
});
