import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { s3 } from '~/utils/aws';

type Image = {
	moderated?: boolean;
	generation: string;
	s3_key: string;
	translated_generation: string;
};

export default component$(() => {
	const imagesSig = useSignal<Image[]>();
	const inputFileSig = useSignal('');
	const selectedImageSig = useSignal<Image | undefined>();
	const statusSig = useSignal<'' | 'Uploading...' | 'Complete!'>('');

	useVisibleTask$(async () => {
		const response = await fetch(import.meta.env.VITE_LAMBDA_URL);
		const images: Image[] = await response.json();
		imagesSig.value = images.filter((i) => !i.moderated);
		selectedImageSig.value = imagesSig.value[0]; 
	});

	const uploadFile = $(async (file: File) => {
		statusSig.value = 'Uploading...';
		try {
			const params = {
				Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
				Key: file.name,
				Body: file,
			};

			s3.putObject(params)
				.on('httpUploadProgress', (...args) => {
					console.log('Uploading...', args);
				})
				.promise();
		} catch (e) {
			console.log(e);
		}
		statusSig.value = 'Complete!';
		setTimeout(() => {
			inputFileSig.value = '';
			statusSig.value = '';
		}, 5000);
	});

	const transformHashTags = (text: string) => {
		let waitingForEnd = false;
		return [...text]
			.map((char) => {
				if (char === '#') {
					waitingForEnd = true;
					return (
						`<a href='#' class='text-gray-900 font-bold text-lg mb-2 hover:text-indigo-600 transition duration-500 ease-in-out'>` +
						char
					);
				}
				if (waitingForEnd && (char === ' ' || char === '»')) {
					waitingForEnd = false;
					return '</a>' + char;
				}
				return char;
			})
			.join('');
	};

	return (
		<div class='max-w-screen-xl mx-auto p-5 sm:p-10 md:p-16 relative'>
			<div class='grid grid-cols-1 sm:grid-cols-12 gap-10'>
				<div class='sm:col-span-12 lg:col-span-3'>
					<label class='flex flex-col items-center justify-center w-full h-[300px] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 max-w-[400px] py-6'>
						<div class='flex flex-col items-center justify-center pt-5 pb-6'>
							<svg
								class='w-8 h-8 mb-4 text-gray-500'
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
							<p class='mb-2 text-sm text-gray-500'>
								<span class='font-semibold'>Click to upload</span> or drag and
								drop
							</p>
						</div>
						<input
							type='file'
							class='hidden'
							accept='.jpeg,.jpg,.png'
							onChange$={async (e) => {
								if (e.target.files) {
									const file = e.target.files[0];
									uploadFile(file);
								}
							}}
							value={inputFileSig.value}
						/>
						<div class='text-center text-gray-500'>{statusSig.value}</div>
					</label>
				</div>

				<div class='sm:col-span-6 lg:col-span-4'>
					{(imagesSig.value || []).map((img, key) => (
						<div key={key} class='flex items-start mb-3 pb-3'>
							<a href='#' class='inline-block mr-3'>
								<div
									class='w-20 h-20 bg-cover bg-center object-contain'
									style={{
										backgroundImage: `url('https://d36xdeoctevqn1.cloudfront.net/${img.s3_key}')`,
										backgroundRepeat: 'no-repeat',
										backgroundSize: 'contain',
									}}
								></div>
							</a>
							<div class='text-sm'>
								<p class='text-gray-600 text-xs'>{img.s3_key}</p>
								<a
									href='#'
									onClick$={() => {
										selectedImageSig.value = img;
									}}
									class='text-gray-900 font-medium hover:text-indigo-600 leading-none'
								>
									{`${img.translated_generation.substring(0, 50)}...`}
								</a>
							</div>
						</div>
					))}
				</div>

				{selectedImageSig.value && (
					<div class='sm:col-span-6 lg:col-span-5'>
						<a href='#'>
							<img
								class='h-56 bg-cover text-center overflow-hidden object-contain'
								src={`https://d36xdeoctevqn1.cloudfront.net/${selectedImageSig.value.s3_key}`}
								alt={selectedImageSig.value.s3_key}
								width={300}
								height={300}
							></img>
						</a>
						<div class='mt-3 bg-white rounded-b lg:rounded-b-none lg:rounded-r flex flex-col justify-between leading-normal'>
							<div class='lg:px-4'>
								<a
									href='#'
									class='text-gray-900 font-bold text-2xl mb-2 hover:text-indigo-600 transition duration-500 ease-in-out'
								>
									{selectedImageSig.value.s3_key}
								</a>
								<p
									class='text-gray-700 text-xl mt-2'
									dangerouslySetInnerHTML={transformHashTags(
										selectedImageSig.value.translated_generation
									)}
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
});

export const head: DocumentHead = {
	title: 'Qwik S3 uploader',
	meta: [{ name: 'description', content: 'Qwik S3 uploader' }],
};
