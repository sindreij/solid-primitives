import { Component, createSignal, Show, For } from "solid-js";
import { render } from "solid-js/web";
import { gql, createGraphQLClient } from "../src";
import { CountryQueryDocument } from "./gqlgen";
import "uno.css";

// This query will be used by `graphql-code-generator` to generate `CountryQueryDocument`.
// Normally it would be defined inside it's own file, but this is just
// a demonstration.
gql`
  query CountryQuery($code: ID!) {
    country(code: $code) {
      name
    }
  }
`;

const App: Component = () => {
	const [code, setCode] = createSignal("BR");

	const query = createGraphQLClient(
		"https://countries.trevorblades.com/",
		{ credentials: 'same-origin' },
	);

	// We can query using a string.
	const [countriesData] = query<{ countries: { name: string; code: string }[] }>(
		gql`
      query CountriesQuery {
        countries {
          name
          code
        }
      }
    `
	);

	// And we can query using `TypedDocumentNode` generated by `graphql-code-generator`.
	// This way the types of the return value and variables are inherited automatically.
	const [countryData] = query(
		CountryQueryDocument,
		() => ({
			code: code()
		}),
		{ country: { name: "loading..." } }
	);

	return (
		<div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
			<h3>Get country by code</h3>
			<input value={code()} oninput={e => setCode(e.currentTarget.value.toUpperCase())}></input>
			<h4>
				<Show when={countryData()?.country?.name} fallback="not found">
					<p>{countryData()!.country!.name}</p>
				</Show>
			</h4>
			<h3>Countries:</h3>
			<Show when={countriesData()}>
				<ul>
					<For each={countriesData()!.countries}>
						{country => (
							<li>
								{country.code} - {country.name}
							</li>
						)}
					</For>
				</ul>
			</Show>
		</div>
	);
};

render(() => <App />, document.getElementById("root")!);
