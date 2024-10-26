"use client";

import { Button, FormControl, FormLabel, Input, Tab, Table, TabList, TabPanel, Tabs } from "@mui/joy";
import { useEffect, useState } from "react";
import { combineRules, createRule, evaluateRule, fetchAllRules, modifyRule } from "./actions/api";
import Snackbar from "@mui/joy/Snackbar";

type RuleType = {
  id: string;
  rule_string: string;
};

export default function Home() {
  const [newRule, setNewRule] = useState("");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reload, setReload] = useState(false);
  const [selectedRule, setSelectedRule] = useState<string>("");
  const [rules, setRules] = useState<{ [id: string]: RuleType }>({});
  const [modifiedRule, setModifiedRule] = useState("");
  const [selectedRules, setSelectedRules] = useState<RuleType[]>([]); // Store selected rules for combining
  const [tabValue, setTabValue] = useState(0); // Track the active tab
  const [ast, setAst] = useState<{ [id: string]: any } | null>(null);
  const [formData, setFormData] = useState({
    age: 0,
    salary: 0,
    experience: 0,
    department: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchAllRules()
      .then((fetchedRules) => {
        const rulesMap = fetchedRules.rules.reduce((acc: { [id: string]: RuleType }, rule: RuleType) => {
          acc[rule.id] = rule;
          return acc;
        }, {});
        setRules(rulesMap);
      })
      .catch((error) => {
        console.error("Failed to fetch rules:", error);
        setRules({});
      });
  }, [reload]);

  const handleSelectRuleForCombine = (rule: RuleType) => {
    setSelectedRules((prev) =>
      prev.some((selected) => selected.id === rule.id) ? prev.filter((selected) => selected.id !== rule.id) : [...prev, rule]
    );
  };

  const handleTabChange = (event: React.SyntheticEvent | null, newValue: string | number | null) => {
    setTabValue(newValue as number);
    setSelectedRules([]);
    setSelectedRule("");
    setModifiedRule("");
    setAst(null);
  };

  return (
    <div className="m-5 lg:p-3 p-2 flex max-lg:flex-col">
      <div className="lg:w-1/2">
        <div className="text-4xl font-semibold">Zeotap AST Rule Engine</div>
        <div className="flex">
          {/* Left Column with Tabs */}
          <div className=" my-10 w-full">
            <Tabs aria-label="Basic tabs" value={tabValue} onChange={handleTabChange}>
              <TabList>
                <Tab>Create Rule</Tab>
                <Tab>Modify Rule</Tab>
                <Tab>Combine Rules</Tab>
                <Tab>Evaluate Data</Tab>
              </TabList>
              <TabPanel value={0}>
                <FormControl size="lg">
                  <FormLabel>Enter Rule</FormLabel>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        const res = await createRule(newRule);
                        setOpen(true);
                        setReload(!reload);
                        setMessage("Rule Added Successfully!");
                        setAst(res.ast);
                        console.log("res: ", res);
                      } catch (e) {
                        setOpen(true);
                        setMessage("Something went wrong! Please try again later.");
                        console.log("Error adding rule", e);
                      }
                    }}
                    className="flex items-center w-full space-x-2 my-1"
                  >
                    <Input
                      required
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      type="text"
                      fullWidth
                      placeholder="salary >= 10000 AND age >= 19"
                    />
                    <Button type="submit" size="lg">
                      Submit
                    </Button>
                  </form>
                </FormControl>
                <div>
                  <div className=" my-4 font-semibold">Resulting AST Object</div>
                  {ast && <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">{JSON.stringify(ast, null, 2)}</pre>}
                </div>
              </TabPanel>
              <TabPanel value={1}>
                <FormControl size="lg">
                  <FormLabel>Select Rule on the Right Side to Modify</FormLabel>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (selectedRule === "") {
                        setOpen(true);
                        setMessage("Please select a rule to modify");
                        return;
                      }
                      try {
                        const res = await modifyRule(modifiedRule, selectedRule);
                        setOpen(true);
                        setReload(!reload);
                        setMessage("Rule Modified Successfully!");
                        console.log("res: ", res);
                        setAst(res.ast);
                      } catch (e) {
                        setOpen(true);
                        setMessage("Something went wrong! Please try again later.");
                        console.log("Error modifying rule", e);
                      }
                    }}
                    className="flex items-center w-full space-x-2 my-1"
                  >
                    <Input
                      value={modifiedRule}
                      onChange={(e) => setModifiedRule(e.target.value)}
                      type="text"
                      fullWidth
                      placeholder="Enter new rule"
                    />
                    <Button disabled={selectedRule === ""} type="submit" size="lg">
                      Submit
                    </Button>
                  </form>
                </FormControl>
                <div>
                  <div className=" my-4 font-semibold">Resulting AST Object</div>
                  {ast && <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">{JSON.stringify(ast, null, 2)}</pre>}
                </div>
              </TabPanel>
              <TabPanel value={2}>
                <FormControl size="lg">
                  <FormLabel>Selected Rules for Combination</FormLabel>
                  <Table size="lg" borderAxis="bothBetween" className="w-full rounded-2xl text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="w-[100px]">Rule ID</th>
                        <th>Rule String</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRules.length > 0 ? (
                        selectedRules.map((rule) => (
                          <tr key={rule.id}>
                            <td className="w-[100px]">{rule.id}</td>
                            <td>{rule.rule_string}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2}>No rules selected</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                  <Button
                    onClick={async () => {
                      if (selectedRules.length < 2) {
                        setOpen(true);
                        setMessage("Please select at least two rules to combine");
                        return;
                      }
                      try {
                        const res = await combineRules(selectedRules.map((rule) => rule.id));
                        setOpen(true);
                        setReload(!reload);
                        setMessage("Rules Combined Successfully!");
                        setSelectedRules([]);
                        console.log("res: ", res);
                        setAst(res.combined_ast);
                      } catch (e) {
                        setOpen(true);
                        setMessage("Something went wrong! Please try again later.");
                        console.log("Error combining rules", e);
                      }
                    }}
                    disabled={selectedRules.length < 2}
                    size="lg"
                    className="my-4"
                  >
                    Combine Rules
                  </Button>
                </FormControl>
                <div>
                  <div className=" my-4 font-semibold">Resulting AST Object</div>
                  {ast && <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">{JSON.stringify(ast, null, 2)}</pre>}
                </div>
              </TabPanel>
              <TabPanel value={3}>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (selectedRule === "") {
                      setOpen(true);
                      setMessage("Please select a rule to evaluate");
                      return;
                    }
                    try {
                      const res = await evaluateRule(Number(selectedRule), formData);
                      setOpen(true);
                      setReload(!reload);
                      setMessage(res.result ? "TRUE" : "FALSE");
                      console.log("res: ", res);
                    } catch (e) {
                      setOpen(true);
                      setMessage("Something went wrong! Please try again later.");
                      console.log("Error modifying rule", e);
                    }
                  }}
                  className=" w-full my-1 "
                >
                  <div className="font-semibold text-xl"> Selected Rule</div>{" "}
                  <div className="text-slate-600 font-medium">{modifiedRule}</div>
                  <div className="my-4 grid grid-cols-2 gap-3">
                    <FormControl size="lg">
                      <FormLabel>Age</FormLabel>
                      <Input name="age" placeholder="30" type="text" value={formData.age} onChange={handleChange} />
                    </FormControl>
                    <FormControl size="lg">
                      <FormLabel>Salary</FormLabel>
                      <Input name="salary" placeholder="10000" type="text" value={formData.salary} onChange={handleChange} />
                    </FormControl>
                    <FormControl size="lg">
                      <FormLabel>Experience</FormLabel>
                      <Input name="experience" placeholder="6" type="text" value={formData.experience} onChange={handleChange} />
                    </FormControl>
                    <FormControl size="lg">
                      <FormLabel>Department</FormLabel>
                      <Input
                        name="department"
                        placeholder="Marketing"
                        type="text"
                        value={formData.department}
                        onChange={handleChange}
                      />
                    </FormControl>
                  </div>
                  <Button className="my-5" type="submit" size="lg">
                    Evaluate
                  </Button>
                </form>
              </TabPanel>
            </Tabs>
          </div>
        </div>
        {/* Right Column with All Rules */}
      </div>
      <div className="lg:w-1/2 space-y-5 lg:pl-10">
        <div className="text-4xl font-semibold">All Rules</div>
        <Table size="lg" borderAxis="bothBetween" className="w-full rounded-2xl text-left border-collapse">
          <thead>
            <tr>
              <th className="w-[100px]">Rule ID</th>
              <th>Rule String</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(rules).length > 0 ? (
              Object.values(rules).map((rule) => (
                <tr
                  key={rule.id}
                  className={` cursor-pointer ${
                    selectedRules.some((selected) => selected.id === rule.id)
                      ? "bg-blue-100 hover:bg-blue-200"
                      : "hover:bg-slate-100"
                  }
                     ${selectedRule === rule.id ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-slate-100"}`}
                  onClick={() => {
                    if (tabValue === 1 || tabValue === 3) {
                      setSelectedRule((prev) => (prev === rule.id ? "" : rule.id));
                      setModifiedRule((prev) => (prev === rule.id ? "" : rule.rule_string));
                    } else if (tabValue === 2) {
                      handleSelectRuleForCombine(rule);
                    }
                  }}
                >
                  <td className="w-[100px]">{rule.id}</td>
                  <td>{rule.rule_string}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2}>No rules available</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      <Snackbar autoHideDuration={2750} open={open} onClose={() => setOpen(false)}>
        {message}
      </Snackbar>
    </div>
  );
}
