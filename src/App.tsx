
import { SEED_ITEMS } from "@/constants/seed";

import CategoryList from "@/components/CategoryList";

function App() {

  return (
    <>
      <div className="px-6 mb-6">
        <h1 className="text-4xl">Auto-Return Classification Board</h1>

        <p className=" text-sm text-neutral-500">
          Click a ticket to plate it at its station. Each plated ticket returns
          on its own when its colored bar drains — or click it to send it back
          early.
        </p>
      </div>

      <CategoryList items={SEED_ITEMS} />
    </>
  );
}

export default App;
