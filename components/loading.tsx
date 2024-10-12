export default function Loading({ subject }: { subject: string }) {
  return (
    <div className={'flex-auto w-full flex justify-center items-center'}>
      <div className={'flex flex-col items-center mt-[-50px]'}>
        <div className={'w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin'} />
        <p className="mt-4">Loading {subject}...</p>
      </div>
    </div>
  );
}