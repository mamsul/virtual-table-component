import clsx from 'clsx';

interface SVGProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function IcSearch({ className, ...props }: SVGProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={clsx('size-12', className)} {...props}>
      <g fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth={4}>
        <path d="M21 38c9.389 0 17-7.611 17-17S30.389 4 21 4S4 11.611 4 21s7.611 17 17 17Z"></path>
        <path
          strokeLinecap="round"
          d="M26.657 14.343A7.98 7.98 0 0 0 21 12a7.98 7.98 0 0 0-5.657 2.343m17.879 18.879l8.485 8.485"
        ></path>
      </g>
    </svg>
  );
}
