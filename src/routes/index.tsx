import { $, component$, useSignal } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { s3 } from '~/utils/aws';

export default component$(() => {
	const imagesSig = useSignal([]);
	const progressSig = useSignal(0);

	const uploadFile = $(async (file: File) => {
		const params = {
			Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
			Key: file.name,
			Body: file,
		};

		const upload = s3
			.putObject(params)
			.on('httpUploadProgress', (evt) => {
				progressSig.value = parseInt(
					((evt.loaded * 100) / evt.total).toString()
				);
				console.log(
					'Uploading ' +
						parseInt(((evt.loaded * 100) / evt.total).toString()) +
						'%'
				);
			})
			.promise();

		await upload.then(() => {
			progressSig.value = 100;
		});
	});

	return (
		<div class='flex items-center justify-center w-full h-full'>
			<label class='flex flex-col items-center justify-center w-full h-[300px] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 dark:border-gray-600 max-w-[400px] pb-6'>
				<div class='flex flex-col items-center justify-center pt-5 pb-6'>
					<svg
						class='w-8 h-8 mb-4 text-gray-500 dark:text-gray-400'
						aria-hidden='true'
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 20 16'
					>
						<path
							stroke='currentColor'
							stroke-linecap='round'
							stroke-linejoin='round'
							stroke-width='2'
							d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
						/>
					</svg>
					<p class='mb-2 text-sm text-gray-500 dark:text-gray-400'>
						<span class='font-semibold'>Click to upload</span> or drag and drop
					</p>
					<p class='text-xs text-gray-500 dark:text-gray-400'>
						SVG, PNG, JPG or GIF (MAX. 800x400px)
					</p>
				</div>
				<input
					type='file'
					class='hidden'
					onChange$={async (_, target) => {
						if (target.files) {
							const file = target.files[0];
							uploadFile(file);
						}
					}}
				/>
				<div class='w-[250px] bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
					<div
						class='bg-blue-600 h-2.5 rounded-full'
						style={`width: ${progressSig.value}%`}
					/>
					{progressSig.value === 100 && (
						<div class='text-center text-gray-500 dark:text-gray-400 py-4'>
							File uploaded!
						</div>
					)}
				</div>
			</label>

			{imagesSig.value.map((_, key) => (
				<div key={key}>aaa</div>
			))}
		</div>
	);
});

export const head: DocumentHead = {
	title: 'Qwik S3 uploader',
	meta: [{ name: 'description', content: 'Qwik S3 uploader' }],
};
