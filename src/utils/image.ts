/**
 * Reads an image File and returns a resized base64 data URL (square cover crop),
 * small enough to store in the DB and render as a room logo.
 */
export function fileToResizedDataUrl(
	file: File,
	size = 128,
	quality = 0.85
): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(new Error("Could not read file"));
		reader.onload = () => {
			const img = new Image();
			img.onerror = () => reject(new Error("Could not load image"));
			img.onload = () => {
				const canvas = document.createElement("canvas");
				canvas.width = size;
				canvas.height = size;
				const ctx = canvas.getContext("2d");
				if (!ctx) return reject(new Error("Canvas not supported"));

				// Square cover crop.
				const min = Math.min(img.width, img.height);
				const sx = (img.width - min) / 2;
				const sy = (img.height - min) / 2;
				ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);

				resolve(canvas.toDataURL("image/jpeg", quality));
			};
			img.src = reader.result as string;
		};
		reader.readAsDataURL(file);
	});
}
