
export default function SubscribeForm() {
    return (
        <div className="min-h-120 bg-cover bg-no-repeat bg-y- pt-40 p-10 text-white-" style={{
            boxShadow: "inset 0 0 0 1000px #5c3b2770",
            backgroundImage: "url(/images/portrait-3.jpeg)",
            backgroundPositionY: -150
        }}>
            <div className="flex gap-4 justify-between px-32">
                <div>
                    <p>Keep in touch with me</p>
                </div>
                <div>
                    <div className="mb-4">
                        <p>Join the circle</p>
                        <p className="">Get a monthly dose of purpose, tech tools, and life notes from Diane.</p>
                    </div>
                    <div className="bg-white p-5 rounded">
                        <div className="flex flex-col gap-4">
                            <div>
                                <p>Name</p>
                                <input type="text" className="border rounded outline-none w-full p-3" />
                            </div>
                            <div>
                                <p>Email</p>
                                <input type="email" className="border rounded outline-none w-full p-3" />
                            </div>

                            <button className="bg-primary p-3 text-white">Submit</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
