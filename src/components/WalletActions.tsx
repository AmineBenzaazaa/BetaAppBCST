import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import {
  useNetwork,
  useContractRead,
  useContractWrite,
  useAccount,
  useWaitForTransaction,
} from "wagmi";
// import { bscTestnet } from 'wagmi/chains';
import { parseEther } from "viem";
import { abi } from "../utils/abi"; // Assuming your ABIs are correctly imported

export default function WalletActions() {
  const { chain } = useNetwork();
  //console.log('Chain :>> ', chain);
  const { address, isConnected } = useAccount();

  const [isTransactionPending, setTransactionPending] = useState(false);
  const [transactionMessage, setTransactionMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");

  // Define token contract address and spender contract address here
  const tokenContractAddress = "0x83dd65F3962e77b823F81169231f807b615826b5";
  const spenderAddress = "0xd9bc68eF08c3E272cd47b80B32849FEBbC8c4128";
  const userAddress = address;
  const requiredAmount = parseEther("20");
  console.log("userAddress :>> ", userAddress);

  // Use Contract Read to check allowance
  let { data: allowanceData, refetch: refetchData } = useContractRead({
    address: tokenContractAddress,
    abi: abi, // Ensure this ABI includes the allowance function
    functionName: "allowance",
    args: [userAddress, spenderAddress],
    watch: true,
    //cacheTime: 1,
    onSuccess(data) {
      console.log("Allowance fetched", data.toString());
    },
    onError(error) {
      console.log("Failed to fetch allowance", error);
    },
  });
  console.log("allowanceData :>> ", allowanceData);

  // Use Contract Write for approve and receiveUSDT
  const {
    write: approveWrite,
    data: approveData,
    error: approveError,
  } = useContractWrite({
    address: tokenContractAddress,
    abi: abi,
    functionName: "approve",
    args: [spenderAddress, requiredAmount],
    onSuccess(data) {
      setTransactionHash(data.hash); // Trigger the transaction waiting process
    },
    onError(error) {
      console.log("Approval Error", error);
      setTransactionMessage("Approval failed.");
      setTransactionPending(false);
    },
  });

  // Triggered when transactionHash is updated
  const { data: transactionData, isError: transactionError } =
    useWaitForTransaction({
      hash: transactionHash,
      enabled: !!transactionHash, // Conditionally execute based on transactionHash
    });

  useEffect(() => {
    if (transactionData) {
      console.log("Transaction confirmed", transactionData);
      setTransactionMessage("Transaction confirmed.");
      setTransactionPending(false);
    }
    if (transactionError) {
      console.log("Transaction error", transactionError);
      setTransactionMessage("Transaction failed.");
      setTransactionPending(false);
    }
  }, [transactionData, transactionError]);

  const { data, isError, error, isLoading, write } = useContractWrite({
    address: "0xd9bc68eF08c3E272cd47b80B32849FEBbC8c4128",
    abi: abi,
    functionName: "receiveUSDT",
    args: [parseEther("20")],
    // gas: parseGwei('2'),
    onSuccess(data) {
      console.log("Success", data);
    },
    onError(error) {
      console.log("Error", error);
    },
  });
  useEffect(() => {
    // refetch();
    //console.log('allowanceData :>> ', allowanceData);
    //console.log('requiredAmount :>> ', requiredAmount);
  });
  // Conditionally handle the approve or ReceiveUSDT based on the allowance
  const handleApproveOrReceiveUSDT = async () => {
    setTransactionPending(true);
    const newAllowanceData = await refetchData();
    console.log("newAllowanceData :>> ", newAllowanceData);
    if (allowanceData >= requiredAmount) {
      setTransactionMessage("You have enough allowance.");
      setTransactionPending(false);
      try {
        write();
        setTransactionMessage("Transaction successful.");
      } catch (error) {
        setTransactionMessage("Transaction failed.");
      }
    } else {
      try {
        approveWrite();
        setTransactionMessage(
          "Approval successful. Please proceed with the transaction."
        );
      } catch (error) {
        setTransactionMessage("Approval failed.");
      }
    }
    setTransactionPending(false);
  };

  useEffect(() => {
    if (address) {
      // void fetchAllowance();
      console.log("allowanceData _address:>> ", allowanceData);
    }
  }, [address]); // Refetch allowance when the user's address changes

  return (
    <>
      <View style={styles.block}>
        <Button
          title="Check Allowance and Proceed"
          onPress={handleApproveOrReceiveUSDT}
          disabled={isTransactionPending}
        />
        {transactionMessage && <Text>{transactionMessage}</Text>}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: 32,
  },
});
