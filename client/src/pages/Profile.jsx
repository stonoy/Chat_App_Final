import React from "react";
import { Form, useNavigation, useOutletContext } from "react-router-dom";
import { customFetch } from "../utils/all";
import { AiOutlineMinusCircle } from "react-icons/ai";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    await customFetch.patch("/user/changename", data);
    console.log("name changed");
  } catch (error) {
    console.log(error?.response?.data?.msg);
  }

  return null;
};

const Profile = () => {
  const { currentUser } = useOutletContext();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="p-1 md:p-4">
      <Form method="post" className="flex gap-1 items-center">
        <h1>Name: </h1>
        <input
          type="text"
          name="name"
          defaultValue={currentUser.name}
          className="input input-ghost input-sm w-full max-w-xs"
        />
        <button
          type="submit"
          className="btn btn-xs text-error  ml-auto md:btn-sm"
        >
          Submit
          {isSubmitting && <span className="loading loading-spinner"></span>}
        </button>
      </Form>

      <div className=" my-2">
        <h1 className="text-2xl text-info-content my-4 mx-auto w-fit">
          Block List
        </h1>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-1 py-3 bg-base-100 text-center text-xs leading-4 font-medium text-base-content uppercase tracking-wider">
                Name
              </th>
              <th className="px-1 py-3 bg-base-100 text-base-content text-center text-xs leading-4 font-medium  uppercase tracking-wider">
                UnBlock
              </th>
            </tr>
          </thead>
          <tbody className=" divide-y divide-gray-200 border-2 border-neutral-content">
            {currentUser.blocklist.map((user, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-no-wrap">
                  <div className="text-sm leading-5 text-base-content">
                    {user.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-no-wrap">
                  <Form
                    method="post"
                    action={`/dashboard/removeblock/${user._id}`}
                    className="text-sm leading-5 text-base-content"
                  >
                    <button className="text-lg">
                      <AiOutlineMinusCircle />
                    </button>
                  </Form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Profile;
