import React from "react";
import { examples } from "../../foundation/examples";
import { ExampleCard } from "./ExampleCard";

import { Link } from "react-router-dom";

export function ExampleList() {
  return (
    <div>
      {examples.map((it) => {
        return (
          <Link to={"/examples/" + it.baseName} key={it.name}>
            <ExampleCard info={it}></ExampleCard>
          </Link>
        );
      })}
    </div>
  );
}
