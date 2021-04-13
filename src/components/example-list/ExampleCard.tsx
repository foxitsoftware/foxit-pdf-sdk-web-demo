import React from "react";
import { Card, CardProps } from "antd";
import { ExampleInfo } from "../../foundation/examples";
import "./card.css";

export interface ExampleCardProps extends CardProps {
  info: ExampleInfo;
}

const { Meta } = Card;

export function ExampleCard(props: ExampleCardProps) {
  return (
    <>
      <Card className="fv__catalog-example-card" {...props}>
        <Meta
          // avatar={}
          title={props.info.name}
          description={props.info.description}
        ></Meta>
      </Card>
    </>
  );
}
