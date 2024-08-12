'use client';

import { PacmanLoader } from 'react-spinners';

const Loader = () => {
	return (
		<div className='absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50'>
			<div className='p-6 text-center bg-white rounded shadow-md'>
				<div className='flex justify-center mb-4'>
					<PacmanLoader
						loading={true}
						// cssOverride={override}
						size={50}
						aria-label='Loading Spinner'
						data-testid='loader'
					/>
				</div>
				<p>Loading...</p>
			</div>
		</div>
	);
};

export default Loader;
