export const addRemotePinningService = async (
  name: string,
  endpoint: string,
  key: string
) => {
  try {
    const res = await fetch(
      `${process.env.KUBO_URL}/api/v0/pin/remote/service/add?arg=${name}&arg=${endpoint}&arg=${key}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      console.log({
        status: res.status,
        statusText: res.statusText,
      });
      const data = await res.json()
      console.log(data);
      if(data.Message !== "service already present") {
        throw new Error(res.statusText);
      }      
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const uploadToRemotePinningService = async (name: string, service: string, cid: string) => {
    try {
        const res = await fetch(
            `${process.env.KUBO_URL}/api/v0/pin/remote/add?arg=${cid}&service=${service}&name=${name}&background=false`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (!res.ok) {
            console.log({
              status: res.status,
              statusText: res.statusText,
            });
            const data = await res.json()
            console.log(data);
            if(data.Message !== "reason: \"DUPLICATE_OBJECT\", details: \"Object already pinned to pinata. Please remove or replace existing pin object.\": 400 Bad Request") {
                throw new Error(res.statusText);
            }            
          }
    } catch (error) {
        console.log(error);
        throw error;
    }
}