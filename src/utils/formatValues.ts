import { BigNumber, ethers } from "ethers";

export const toDisplayNumber = (value: number) => {
  const bn = BigNumber.from(value.toString());
  return Numeral(ethers.utils.formatEther(bn)).format("0.000");
};
