export default function (plop) {
	plop.setGenerator("component", {
		description: "Create a new component",
		prompts: [
			{
				type: "list",
				name: "layer",
				message: "Layer:",
				choices: ["shared", "widgets", "features"],
			},
			{
				type: "input",
				name: "name",
				message: "Component name (kebab-case):",
				validate: (v) => /^[a-z][a-z0-9-]*$/.test(v) || "Use kebab-case",
			},
		],
		actions: [
			{
				type: "add",
				path: "src/components/{{layer}}/{{kebabCase name}}/{{kebabCase name}}.tsx",
				templateFile: "plop-templates/component.tsx.hbs",
			},
			{
				type: "add",
				path: "src/components/{{layer}}/{{kebabCase name}}/{{kebabCase name}}.module.scss",
				templateFile: "plop-templates/component.module.scss.hbs",
			},
			{
				type: "add",
				path: "src/components/{{layer}}/{{kebabCase name}}/index.ts",
				templateFile: "plop-templates/index.ts.hbs",
			},
		],
	});
}
