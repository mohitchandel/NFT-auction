import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export const Navigation = () => {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">PhysicalPunk</a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href={"/auctions"}>Auctions</Link>
          </li>
          <li>
            <Link href={"/"}>Home</Link>
          </li>
          <li>
            <ConnectButton />
          </li>
        </ul>
      </div>
    </div>
  );
};
