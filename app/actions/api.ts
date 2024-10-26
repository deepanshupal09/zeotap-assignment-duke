"use server"
export async function fetchAllRules() {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/fetch-rules`, {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-cache",
        });

        console.log("response: ", response)

        const data = await response.json(); // Parse the JSON response
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function createRule(rule: string) {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/create_rule/?rule_string=${rule}`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },

            cache: "no-cache",
        });

        console.log("response: ", response)

        const data = await response.json(); // Parse the JSON response
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
export async function modifyRule(rule: string, rule_id: string) {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/modify_rule/?rule_id=${rule_id}&rule_string=${rule}`, {
            method: "PUT",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },

            cache: "no-cache",
        });

        console.log("response: ", response)

        const data = await response.json(); // Parse the JSON response
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function combineRules(rules: string[]) {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/combine_rules`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "rules": rules,
                "operator": "AND"
            }),

            cache: "no-cache",
        });

        console.log("response: ", response)

        const data = await response.json(); // Parse the JSON response
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function evaluateRule(rule: number, user_data: {age: number, experience: number, salary: number, department: string}) {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/evaluate_rule/`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "rule_id": rule,
                "user_data": user_data 
            }),

            cache: "no-cache",
        });

        console.log("rule: ", rule)

        console.log("response: ", response)

        const data = await response.json(); // Parse the JSON response
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}