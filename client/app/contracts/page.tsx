import {
	ContractsClient,
	type CoreContract,
} from '../../components/contracts/ContractsClient';
import type { BlockchainStatus } from '@/lib/blockchain';

async function getInitialData(): Promise<{
	status: BlockchainStatus | null;
	contracts: CoreContract[];
}> {
	try {
		const [statusRes, contractsRes] = await Promise.all([
			fetch(
				`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/blockchain/status`,
				{
					cache: 'no-store',
				}
			),
			fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/contracts`, {
				cache: 'no-store',
			}),
		]);

		const statusJson = await statusRes.json().catch(() => null);
		const contractsJson = await contractsRes.json().catch(() => null);

		return {
			status: statusJson?.data || null,
			contracts: Array.isArray(contractsJson?.data) ? contractsJson.data : [],
		};
	} catch (_) {
		return { status: null, contracts: [] };
	}
}

export default async function ContractsPage() {
	const { status, contracts } = await getInitialData();
	return (
		<ContractsClient
			initialBlockchainStatus={status}
			initialContracts={contracts}
		/>
	);
}
