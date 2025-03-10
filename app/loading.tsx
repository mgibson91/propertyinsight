export default function Loading() {
  return (
    <div className={'flex-auto w-[100vw] flex justify-center items-center'}>
      <div className={'flex flex-col items-center mt-[-50px]'}>
        <img src={'/logo.svg'} className={'w-12 animate-pulse'} />
        <p>Loading...</p>
      </div>
    </div>
  );
}
