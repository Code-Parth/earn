import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Props {
  onClose: () => void;
  isOpen: boolean;
  totalWinners: number;
  totalPaymentsMade: number;
  rewards: any;
  bountyId: string | undefined;
}

function PublishResults({
  isOpen,
  onClose,
  totalWinners,
  totalPaymentsMade,
  rewards,
  bountyId,
}: Props) {
  const router = useRouter();
  const [isPublishingResults, setIsPublishingResults] = useState(false);
  const [isWinnersAnnounced, setIsWinnersAnnounced] = useState(false);
  let alertType:
    | 'loading'
    | 'info'
    | 'error'
    | 'warning'
    | 'success'
    | undefined = 'warning';
  let alertTitle = '';
  let alertDescription = '';
  if (rewards?.length && totalWinners !== rewards?.length) {
    const remainingWinners = (rewards?.length || 0) - totalWinners;
    alertType = 'error';
    alertTitle = 'Select All Winners!';
    alertDescription = `You still have to select ${remainingWinners} more ${
      remainingWinners === 1 ? 'winner' : 'winners'
    } before you can publish the results publicly.`;
  } else if (rewards?.length && totalPaymentsMade !== rewards?.length) {
    const remainingPayments = (rewards?.length || 0) - totalPaymentsMade;
    alertType = 'warning';
    alertTitle = 'Pay All Winners!';
    alertDescription = `You can publish results without paying, but we recommend you pay all winners before publishing results. You still have to pay ${remainingPayments} more ${
      remainingPayments === 1 ? 'winner' : 'winners'
    }.`;
  }

  const publishResults = async () => {
    if (!bountyId) return;
    setIsPublishingResults(true);
    try {
      await axios.post(`/api/bounties/announce/${bountyId}/`);
      setIsWinnersAnnounced(true);
      setIsPublishingResults(false);
    } catch (e) {
      setIsPublishingResults(false);
    }
  };

  useEffect(() => {
    if (!isWinnersAnnounced) return;
    const timer = setTimeout(() => {
      router.push('/dashboard/bounties');
    }, 1500);
    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timer);
  }, [isWinnersAnnounced]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Publish Results</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isWinnersAnnounced && (
            <Alert
              alignItems="center"
              justifyContent="center"
              flexDir="column"
              py={4}
              textAlign="center"
              status="success"
              variant="subtle"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Results Announced Successfully!
              </AlertTitle>
              <AlertDescription maxW="sm">
                The results have been announced publicly. Everyone can view the
                results on the Bounty&apos;s page.
                <br />
                <br />
                <Text as="span" color="brand.slate.500" fontSize="sm">
                  Redirecting...
                </Text>
              </AlertDescription>
            </Alert>
          )}
          {!isWinnersAnnounced &&
            rewards?.length &&
            totalWinners === rewards?.length && (
              <Text mb={4}>
                Publishing the results of this bounty will make the results
                public for everyone to see!
                <br />
                YOU CAN&apos;T GO BACK ONCE YOU PUBLISH THE RESULTS!
              </Text>
            )}
          {!isWinnersAnnounced && alertTitle && alertDescription && (
            <Alert status={alertType}>
              <AlertIcon boxSize={8} />
              <Box>
                <AlertTitle>{alertTitle}</AlertTitle>
                <AlertDescription>{alertDescription}</AlertDescription>
              </Box>
            </Alert>
          )}
        </ModalBody>
        <ModalFooter>
          {!isWinnersAnnounced && (
            <>
              <Button onClick={onClose} variant="ghost">
                Close
              </Button>
              <Button
                ml={4}
                isDisabled={rewards?.length && totalWinners !== rewards?.length}
                isLoading={isPublishingResults}
                loadingText={'Publishing...'}
                onClick={() => publishResults()}
                variant="solid"
              >
                Publish
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default PublishResults;
