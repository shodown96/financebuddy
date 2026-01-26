"use client"
export default function Page() {
    return (
        <div className="text-black!">
            {/* They don't actually have to be a value of 10 */}
            <div className='grid grid-cols-12 w-full min-h-[calc(100vh-100px)]'>
                {/* Left Child */}
                <div className="col-span-12 md:col-span-4 bg-blue-100 flex flex-col justify-end p-5">
                    {/* Left Inner Child */}
                    <div className="md:-mr-20 bg-white p-5 rounded-lg z-20 md:mb-40 transition-all duration-300">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora ad, explicabo iusto quas amet aut optio aspernatur excepturi quos veniam cum provident, exercitationem magni aliquam repellendus sequi officiis obcaecati corrupti.
                    </div>
                </div>
                <div className="col-span-12 md:col-span-4 bg-red-100 flex flex-col md:justify-center justify-end p-5 max-md:pb-0">
                    {/* <img className="max-md:h-100 max-md:object-contain" src="https://picsum.photos/id/870/200/300?grayscale&blur=2" alt="" /> */}
                   <div className="md:absolute md:bottom-0 md:left-0 md:right-0 flex justify-center">
                     <img className="h-200 max-md:object-contain ml-15" src="/images/profile.png" alt="" />
                   </div>
                </div>

                {/* Right Child */}
                <div className="col-span-12 md:col-span-4 bg-yellow-100 p-5 flex flex-col justify-center">
                    {/* Right Inner Child */}
                    <div className="md:-ml-20 bg-white p-5 rounded-lg z-20 transition-all duration-300">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora ad, explicabo iusto quas amet aut optio aspernatur excepturi quos veniam cum provident, exercitationem magni aliquam repellendus sequi officiis obcaecati corrupti.
                    </div>
                </div>
            </div>
        </div>
    )
}
