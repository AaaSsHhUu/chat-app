import { Link, Outlet, useLocation } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { MdOutlineAccountTree } from "react-icons/md";

function Settings() {
    const { pathname } = useLocation();
    return (
        <div className="mt-18 flex w-full bg-white text-black dark:bg-slate-800 dark:text-white" style={{ height: "calc(100vh - 72px)" }}>
            {/* Setting sidebar */}
            <aside className="w-full bg-white text-black dark:bg-slate-900 dark:text-white sm:w-full md:w-[30%] lg:w-80 h-full">
                <div className="flex flex-col w-full pt-4 px-3">
                    <Link 
                        to={"/settings/profile"}
                        className={`rounded-md px-4 py-2 font-semibold flex gap-2 items-center ${
                            pathname.includes("profile")
                                ? "bg-slate-200 dark:bg-slate-700"
                                : ""
                        } `}
                    >
                        <CgProfile />
                        Profile
                    </Link>
                    <Link 
                        to={"/settings/account"}
                        className={`rounded-md px-4 py-2 font-semibold flex gap-2 items-center ${
                            pathname.includes("account")
                                ? "bg-slate-200 dark:bg-slate-700"
                                : ""
                        } `}
                    >
                        <MdOutlineAccountTree />
                        Account
                    </Link>
                </div>
            </aside>
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    )
}

export default Settings