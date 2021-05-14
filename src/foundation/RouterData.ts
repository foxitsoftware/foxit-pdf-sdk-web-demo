import { examples } from "./examples";

export default examples.map((it) => {
  return {
    path: "/examples/" + it.name,
    name: it.name,
  };
});
