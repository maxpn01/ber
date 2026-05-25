import type { SVGProps } from "react";

export const EmployeeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={props.width ?? 25}
    height={props.height ?? 25}
    viewBox="0 0 23 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.7926 5.42136C16.2904 2.43908 14.2232 0 11.1997 0C8.17743 0 6.11019 2.43908 6.60691 5.42136L7.35899 9.9386C7.65803 11.7286 9.38619 13.1925 11.2 13.1925C13.0147 13.1925 14.7417 11.7284 15.0399 9.9386L15.7926 5.42136Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.122 13.4403C14.0692 14.4301 12.6759 15.059 11.2 15.059C9.72412 15.059 8.33084 14.4301 7.27804 13.4403L1.771 15.2762C0.7966 15.6005 0 16.707 0 17.7332V22.4H22.4V17.7332C22.4 16.707 21.6034 15.6005 20.629 15.2762L15.122 13.4403Z"
      fill="currentColor"
    />
  </svg>
);
