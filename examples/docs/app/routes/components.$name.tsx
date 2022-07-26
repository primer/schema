import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { primerApi } from "~/primer-api-client";
import { sentenceCase } from "change-case";
import { gql } from "graphql-request";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = ({ params }) => ({
  title: `${sentenceCase(params.name || "")} | Primer`,
});

// TODO: Generate this type from the GraphQL schema
type LoaderData = {
  component: {
    name: string;
    description: string;
    implementations: Array<{
      framework: "REACT" | "RAILS" | "FIGMA";
      status: "ALPHA" | "BETA" | "STABLE" | "DEPRECATED";
      source: string;
    }>;
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  const name = params.name;

  if (!name) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  const data = await primerApi.request(
    gql`
      query ($name: String!) {
        component(where: { name: $name }) {
          name
          description
          implementations {
            framework
            status
            source
          }
        }
      }
    `,
    {
      name: sentenceCase(name),
    }
  );

  return json(data);
};

export default function ComponentPage() {
  const data = useLoaderData<LoaderData>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>{data.component.name}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
