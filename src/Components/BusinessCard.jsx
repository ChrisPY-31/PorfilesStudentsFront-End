
const BusinessCard = ({ empresa }) => {
    return (
        <div className='flex-shrink-0 cursor-pointer'>
            <div className='relative h-[20px] w-full flex justify-center items-center hover:shadow-xl transition-shadow duration-300'>
                <img className='object-contain w-[100px] imagen__empresa'
                    src={`${empresa.foto}`} alt={empresa.nombre} />
            </div>
        </div>
    )
}

export default BusinessCard