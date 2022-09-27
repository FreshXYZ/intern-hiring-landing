import Image from 'next/image';
import mockup from '../public/images/mockup.png';

const Tasks: React.ComponentType = () => {
  return (
    <div className="grid grid-cols-2 gap-8 md:gap-12">
      <div className="col-span-2 font-mono text-8xl font-bold md:col-span-1">
        <div
          className="text-transparent"
          style={{
            WebkitTextStrokeColor: 'white',
            WebkitTextStrokeWidth: 3,
          }}
        >
          YOUR
        </div>
        <div>TASKS</div>
      </div>
      <div className="col-span-2 md:col-span-1">
        <div className="inline-flex bg-[#A49EF9] p-2.5 font-mono text-2xl font-bold text-black">
          TASK 1
        </div>
        <p className="mt-2">
          Build a basic log-in page with the design provided by Fresh.
        </p>
        <div className="relative mt-2 overflow-hidden rounded-lg pt-[75%]">
          <Image alt="Mockup" layout="fill" objectFit="cover" src={mockup} />
        </div>
        <div className="mt-12 inline-flex bg-[#F3734E] p-2.5 font-mono text-2xl font-bold text-black">
          TASK 2
        </div>
        <p className="mt-2">
          Make sure the page is responsive. A mobile design will be provided for
          your reference 🙂
        </p>
        <div className="mt-12 inline-flex bg-[#B1ECD3] p-2.5 font-mono text-2xl font-bold text-black">
          TASK 3
        </div>
        <p className="mt-2">Build an API to handle login requests.</p>
      </div>
    </div>
  );
};

export default Tasks;
