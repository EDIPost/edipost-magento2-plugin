<?php

namespace Edipost\Shipment\Helper;

use Magento\Framework\App\Config\ScopeConfigInterface;

/**
 * Shipment helper for working with shipment data.
 */

class ShipmentWorker extends \Magento\Framework\App\Helper\AbstractHelper
{
    /**
     * @param \Magento\Framework\App\Helper\Context $context,
     * @param \Magento\Sales\Model\Order\Shipment\TrackFactory $trackFactory
     * @param \Magento\Sales\Model\Order\ShipmentRepository $shipmentRepository ,
     * @param \Magento\Sales\Model\Order\ShipmentFactory $shipmentFactory ,
     * @param \Magento\Shipping\Model\ShipmentNotifier $shipmentNotifier ,
     * @param \Magento\Sales\Model\Convert\Order $convertOrder,
     * @param \Magento\Framework\Registry $registry
     */
    public function __construct(
        \Magento\Framework\App\Helper\Context $context,
        \Magento\Sales\Model\Order\Shipment\TrackFactory $trackFactory,
        \Magento\Sales\Model\Order\ShipmentRepository $shipmentRepository,
        \Magento\Sales\Model\Order\ShipmentFactory $shipmentFactory,
        \Magento\Shipping\Model\ShipmentNotifier $shipmentNotifier,
        \Magento\Sales\Model\Convert\Order $convertOrder,
        \Magento\Framework\Registry $registry
    )
    {
        parent::__construct($context);
        $this->trackFactory = $trackFactory;
        $this->shipmentFactory = $shipmentFactory;
        $this->shipmentRepository = $shipmentRepository;
        $this->shipmentNotifier = $shipmentNotifier;
        $this->convertOrder = $convertOrder;
        $this->registry = $registry;
    }

    /**
     * Creates a new shipment for the specified order.
     *
     * @param \Magento\Sales\Model\Order $order
     */
    public function createShipment($order)
    {
        $shipment = null;
        if ($order->canShip()) {
            $shipment = $this->convertOrder->toShipment($order);


            foreach ($order->getAllItems() AS $orderItem) {

                if (!$orderItem->getQtyToShip() || $orderItem->getIsVirtual()) {
                    continue;
                }
                $qtyShipped = $orderItem->getQtyToShip();

                $shipmentItem = $this->convertOrder->itemToShipmentItem($orderItem)->setQty($qtyShipped);

                $shipment->addItem($shipmentItem);
            }

            $shipment->register();
            $shipment->getOrder()->setIsInProcess(true);


            $this->shipmentRepository->save($shipment);
            $shipment->getOrder()->save();

            $this->shipmentNotifier->notify($shipment);
            $this->shipmentRepository->save($shipment);
        }
        return $shipment;
    }


    /**
     * Delete shipments from specified order.
     *
     * @param \Magento\Sales\Model\Order $order
     */
    public function deleteShipments($order)
    {

        if ($this->registry->registry('isSecureArea')) {
            $this->registry->unregister('isSecureArea');
        }
        $this->registry->register('isSecureArea', true);

        $_shipments = $order->getShipmentsCollection();

        if ($_shipments) {
            foreach ($_shipments as $_shipment) {
                $_shipment->delete();
            }
        }

    }

    /**
     * Create track data for shipment.
     *
     * @param \Magento\Sales\Model\Order\Shipment\ $shipment
     * @param string $track_nuber
     * @param string $carrier_code
     * @param string $title
     */
    public function createTrackData($shipment, $track_number, $carrier_code = 'custom', $title = '')
    {
        $data = array(
            'carrier_code' => $carrier_code,
            'title' => $title,
            'number' => $track_number
        );

        $track = $this->trackFactory->create()->addData($data);
        $shipment->addTrack($track)->save();

    }
}