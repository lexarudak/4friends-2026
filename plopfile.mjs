const LAYERS = ["shared", "widgets", "features"];

export default function Fn(plop) {
	plop.setGenerator("component", {
		description: "Create a new component",
		prompts: [
			{
				type: "input",
				name: "path",
				message: `Layer/Name — e.g. shared/section:`,
				validate: (v) => {
					const [layer, name] = v.split("/");
					if (!LAYERS.includes(layer))
						return `Layer must be one of: ${LAYERS.join(", ")}`;
					if (!/^[a-z][a-z0-9-]*$/.test(name))
						return "Component name must be kebab-case";
					return true;
				},
			},
		],
		actions(data) {
			const [layer, name] = data.path.split("/");
			data.layer = layer;
			data.name = name;
			return [
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
			];
		},
	});
}
